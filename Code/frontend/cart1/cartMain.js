// cartMain.js
import { fetchCartItems, renderCartFromServer } from '../js/cart.js';
import { checkout, closePaymentModal, processPayment } from '../js/payment.js';
import { checkLoginOnLoad } from '../js/session.js';
import { API_BASE_PATH } from '../js/config.js';

async function initCartPage() {
  checkLoginOnLoad();
  try {
    const items = await fetchCartItems();
    renderCartFromServer(items);
  } catch (err) {
    console.error("Could not load cart:", err);
    alert("❌ Failed to load your cart.");
  }
}

initCartPage();

window.checkout          = checkout;
window.processPayment    = processPayment;
window.closePaymentModal = closePaymentModal;
window.logout            = () => {
  localStorage.clear();
  fetch(`${API_BASE_PATH}/logout`, {
    credentials: 'include'
  }).then(() => window.location.href = '../../design/home/index.html');
};
