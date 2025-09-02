// cartMain.js
import { fetchCartItems, renderCartFromServer} from '../../js/cart.js';
import { cartController } from '../../js/cart.js'; 
import { checkout, closePaymentModal, processPayment } from '../../js/payment.js';
import { checkLoginOnLoad } from '../../js/session.js';
import { API_BASE_PATH } from '../../js/config.js';

export async function initCartPage() {
  checkLoginOnLoad();
  try {
    await cartController.loadCart();

    // --- Format values after cart is rendered ---
    const subtotalEl = document.querySelector(".cartTotal");
    const discountEl = document.querySelector(".cartDiscount");
    const totalEl = document.querySelector(".amt li:last-child");
    const deliveryEl = document.querySelector(".del-info li:last-child");

    if (subtotalEl) {
      subtotalEl.textContent = formatMoney(parseFloat(subtotalEl.textContent)).replace("₱", "");
    }
    if (discountEl) {
      discountEl.textContent = formatMoney(parseFloat(discountEl.textContent)).replace("₱", "");
    }
    if (deliveryEl) {
      let fee = deliveryEl.textContent.replace("₱", "").trim();
      deliveryEl.textContent = formatMoney(parseFloat(fee));
    }
    if (totalEl) {
      let totalVal = totalEl.textContent.replace("₱", "").trim();
      totalEl.textContent = formatMoney(parseFloat(totalVal));
    }

    // Checkout modal
    const payTotal = document.getElementById("paymentTotal");
    const payDiscount = document.getElementById("paymentDiscount");
    const finalAmt = document.getElementById("finalAmount");

    if (payTotal)   payTotal.textContent   = formatMoney(parseFloat(payTotal.textContent)).replace("₱", "");
    if (payDiscount) payDiscount.textContent = formatMoney(parseFloat(payDiscount.textContent)).replace("₱", "");
    if (finalAmt)   finalAmt.textContent   = formatMoney(parseFloat(finalAmt.textContent)).replace("₱", "");
    
  } catch (err) {
    console.error("Could not load cart:", err);
    alert("❌ Failed to load your cart.");
  }
}

function formatMoney(amount) {
  if (isNaN(amount) || amount === null) return "0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount).replace("PHP", "₱");
}


window.checkout          = checkout;
window.processPayment    = processPayment;
window.closePaymentModal = closePaymentModal;
window.logout            = () => {
  localStorage.clear();
  fetch(`${API_BASE_PATH}/logout`, {
    credentials: 'include'
  }).then(() => window.location.href = '../home/home.html');
};


