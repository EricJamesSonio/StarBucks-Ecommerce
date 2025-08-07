import { renderCartFromServer, fetchCartItems } from './cart.js';
import { API_BASE_PATH } from './config.js';

export function checkout() {
  // Step 1: Verify session
  fetch(`${API_BASE_PATH}/check_login`, {
    credentials: 'include'
  })
    .then(r => {
      if (r.status === 401) throw new Error("Not authorized");
      return r.json();
    })
    .then(data => {
      if (!data.status) throw new Error("Not logged in");

      // Step 2: Fetch cart from server
      return fetchCartItems();
    })
    .then(cartItems => {
      if (!cartItems.length) {
        alert("🛒 Cart is empty.");
        return;
      }

      const total = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * parseInt(i.quantity), 0);

      // Save cartItems in window to use later for receipt
      window.cartSnapshot = cartItems;

      showPaymentModal(total);
    })
    .catch(err => {
      alert("⚠️ " + err.message);
      window.location.href = '../login/login.html';
    });
}

export function showPaymentModal(total) {
  const discount = total * 0.10;
  const final = total - discount;
  document.getElementById('paymentTotal').textContent = total.toFixed(2);
  document.getElementById('paymentDiscount').textContent = discount.toFixed(2);
  document.getElementById('finalAmount').textContent = final.toFixed(2);
  document.getElementById('cashInput').value = '';
  document.getElementById('paymentModal').style.display = 'flex';
  window.paymentData = { total, discount, final };
}

export function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
}

export function processPayment() {
  const amt = parseFloat(document.getElementById('cashInput').value);
  const { total, discount, final } = window.paymentData;
  const type = document.getElementById('paymentType').value;

  if (isNaN(amt) || amt < final) {
    alert("❌ Not enough cash.");
    return;
  }

  const change = amt - final;

  fetch(`${API_BASE_PATH}/payment`, {
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
  })
  .then(r => r.ok ? r.json() : r.text().then(txt => { throw new Error(txt) }))
  .then(data => {
    if (!data.orderId || !data.receiptId) {
      throw new Error(data.error || "Payment failed");
    }

    alert(`✅ Paid! Change: ₱${change.toFixed(2)}`);
    closePaymentModal();

    // Prepare receipt items
    const items = window.cartSnapshot.map(item => ({
      name: item.name + (item.size_name ? ` (${item.size_name})` : ""),
      quantity: item.quantity,
      price: parseFloat(item.price),
      total: (parseFloat(item.price) * item.quantity).toFixed(2)
    }));

    // Show receipt with items
    showReceipt({
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

    // Refresh cart after payment
    return fetchCartItems();
  })
  .then(updatedCart => {
    renderCartFromServer(updatedCart);
  })
  .catch(err => {
    console.error("Payment error:", err);
    alert("❌ Payment failed:\n" + err.message.trim());
  });
}

function showReceipt(data) {
  document.getElementById("receiptContainer").style.display = "block"; // 👈 ADD THIS

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
