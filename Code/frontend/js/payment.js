// checkout.js
import { renderCartFromServer, fetchCartItems } from './cart.js';
import { API_BASE_PATH } from './config.js';

class Checkout {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
        this.cartSnapshot = [];
        this.paymentData = {};
    }

    async checkout() {
        try {
            await this.verifySession();
            const cartItems = await fetchCartItems();

            if (!cartItems.length) {
                alert("🛒 Cart is empty.");
                return;
            }

            this.cartSnapshot = cartItems;
            const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * parseInt(i.quantity), 0);
            this.showPaymentModal(total);

        } catch (err) {
            alert("⚠️ " + err.message);
            window.location.href = '../login/login.html';
        }
    }

    async verifySession() {
        const res = await fetch(`${this.apiBasePath}/check_login`, { credentials: 'include' });
        if (res.status === 401) throw new Error("Not authorized");
        const data = await res.json();
        if (!data.status) throw new Error("Not logged in");
    }

    showPaymentModal(total) {
        const discount = total * 0.10;
        const final = total - discount;

        document.getElementById('paymentTotal').textContent = total.toFixed(2);
        document.getElementById('paymentDiscount').textContent = discount.toFixed(2);
        document.getElementById('finalAmount').textContent = final.toFixed(2);
        document.getElementById('cashInput').value = '';
        document.getElementById('paymentModal').style.display = 'flex';

        this.paymentData = { total, discount, final };
    }

    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
    }

    async processPayment() {
        const amt = parseFloat(document.getElementById('cashInput').value);
        const { total, discount, final } = this.paymentData;
        const type = document.getElementById('paymentType').value;

        if (isNaN(amt) || amt < final) {
            alert("❌ Not enough cash.");
            return;
        }

        const change = amt - final;

        try {
            const res = await fetch(`${this.apiBasePath}/payment`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    amountPaid: amt,
                    total,
                    discount,
                    finalAmount: final
                })
            });

            const data = await (res.ok ? res.json() : res.text().then(txt => { throw new Error(txt) }));

            if (!data.orderId || !data.receiptId) {
                throw new Error(data.error || "Payment failed");
            }

            alert(`✅ Paid! Change: ₱${change.toFixed(2)}`);
            this.closePaymentModal();

            const items = this.cartSnapshot.map(item => ({
                name: item.name + (item.size_name ? ` (${item.size_name})` : ""),
                quantity: item.quantity,
                price: parseFloat(item.price),
                total: (parseFloat(item.price) * item.quantity).toFixed(2)
            }));

            this.showReceipt({
                items,
                order_id: data.orderId,
                discount_type: type,
                discount_amount: discount.toFixed(2),
                total: total.toFixed(2),
                final: final.toFixed(2),
                paid: amt.toFixed(2),
                change: change.toFixed(2),
                date: new Date().toLocaleString()
            });

            const updatedCart = await fetchCartItems();
            renderCartFromServer(updatedCart);

        } catch (err) {
            console.error("Payment error:", err);
            alert("❌ Payment failed:\n" + err.message.trim());
        }
    }

    showReceipt(data) {
        document.getElementById("receiptContainer").style.display = "block";

        const receiptBox = document.getElementById("receiptBox");
        const itemsHTML = data.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₱${item.price.toFixed(2)}</td>
                <td>₱${item.total}</td>
            </tr>
        `).join("");

        receiptBox.innerHTML = `
            <h2>☕ Starbucks Receipt</h2>
            <p><strong>Order ID:</strong> ${data.order_id}</p>

            <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; margin-top: 10px;">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <p><strong>Total:</strong> ₱${data.total}</p>
            <p><strong>Discount:</strong> ₱${data.discount_amount} (${data.discount_type})</p>
            <p><strong>Final:</strong> ₱${data.final}</p>
            <p><strong>Paid:</strong> ₱${data.paid}</p>
            <p><strong>Change:</strong> ₱${data.change}</p>
            <p><strong>Date:</strong> ${data.date}</p>

            <button onclick="window.print()">🖨️ Print</button>
        `;
    }
}

// ===== Singleton Export =====
export const checkoutManager = new Checkout(API_BASE_PATH);

// Backwards compatibility for existing function calls
export function checkout() {
    checkoutManager.checkout();
}
export function showPaymentModal(total) {
    checkoutManager.showPaymentModal(total);
}
export function closePaymentModal() {
    checkoutManager.closePaymentModal();
}
export function processPayment() {
    checkoutManager.processPayment();
}
