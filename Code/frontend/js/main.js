// main.js
import { loadSizes, checkLoginOnLoad } from './session.js';
import { loadCategory, showCategories, loadTopSelling } from './api.js';
import { openModal, closeModal, addToCart } from './modal.js';
import { checkout, closePaymentModal, processPayment } from './payment.js';

loadSizes();
if (!localStorage.getItem("isGuest") && !localStorage.getItem("user")) {
  localStorage.setItem("isGuest", true); // Set guest mode
  // Do NOT redirect to login
} else {
  checkLoginOnLoad(); // Proceed with normal login check
}

// ⬇️ Make functions available for inline HTML onclick handlers
window.loadCategory = loadCategory;
window.showCategories = showCategories;
window.loadTopSelling  = loadTopSelling; 
window.openModal = openModal;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.checkout = checkout;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
