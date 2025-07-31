Frontend/
    js/

api.js 

// api.js
import { openModal } from './modal.js';

export function loadCategory(categoryName) {
  currentCategory = categoryName;
  document.getElementById('categorySelect').style.display = 'none';
  document.getElementById('backButton').style.display = 'block';

  fetch('http://localhost/SOFTENG2/backend/api/index2.php/items', {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item =>
        (categoryName === 'Drink' && item.category_id == 1) ||
        (categoryName === 'Sandwich' && item.category_id == 2)
      );
      displayItems(filtered);
    })
    .catch(err => console.error('Could not load items:', err));
}

function displayItems(items) {
  const itemList = document.getElementById('itemList');
  itemList.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.onclick = () => openModal(item);

    card.innerHTML = `
      <img src="images/${item.image_url || 'default.jpg'}" class="item-img" alt="${item.name}">
      <div class="item-name">${item.name}</div>
      <div class="item-description">${item.description}</div>
      <div class="item-price">₱${parseFloat(item.price).toFixed(2)}</div>
    `;
    itemList.appendChild(card);
  });
}

export function showCategories() {
  document.getElementById('categorySelect').style.display = 'block';
  document.getElementById('itemList').innerHTML = '';
  document.getElementById('backButton').style.display = 'none';
}

cart.js 

// cart.js
export const cart = [];

export function renderCart() {
  const cartItems = document.getElementById('cartItems');
  cartItems.innerHTML = '';

  let total = 0;
  cart.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    total += lineTotal;

    const div = document.createElement('div');
    div.textContent =
      `${item.name} (${item.sizeText}) x ${item.quantity} = ₱${lineTotal.toFixed(2)}`;
    cartItems.appendChild(div);
  });

  document.getElementById('cartTotal').textContent = total.toFixed(2);
  document.getElementById('cartDiscount').textContent = '0.00';
}

main.js

// main.js
import { loadSizes, checkLoginOnLoad } from './session.js';
import { loadCategory, showCategories } from './api.js';
import { openModal, closeModal, addToCart } from './modal.js';
import { checkout, closePaymentModal, processPayment } from './payment.js';

loadSizes();
if (!localStorage.getItem("isGuest")) checkLoginOnLoad();

// ⬇️ Make functions available for inline HTML onclick handlers
window.loadCategory = loadCategory;
window.showCategories = showCategories;
window.openModal = openModal;
window.closeModal = closeModal;
window.addToCart = addToCart;
window.checkout = checkout;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;


modal.js

// modal.js
import { getSizes } from './session.js';
import { cart, renderCart } from './cart.js';

let currentItem = null;

export function openModal(item) {
  currentItem = item;
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalQuantity').value = 1;

  const sizeSelect = document.getElementById('modalSize');
  sizeSelect.innerHTML = '';

  getSizes().forEach(sz => {
    const opt = document.createElement('option');
    opt.value = sz.id;
    opt.textContent = `${sz.name} (+₱${parseFloat(sz.price_modifier).toFixed(2)})`;
    opt.dataset.modifier = sz.price_modifier;
    sizeSelect.appendChild(opt);
  });

  document.getElementById('itemModal').style.display = 'flex';
}

export function closeModal() {
  document.getElementById('itemModal').style.display = 'none';
}

export function addToCart() {
  const qty = parseInt(document.getElementById('modalQuantity').value, 10);
  if (qty < 1) return;

  const sizeSelect = document.getElementById('modalSize');
  const sizeId = sizeSelect.value;
  const sizeText = sizeSelect.options[sizeSelect.selectedIndex].text;
  const mod = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].dataset.modifier);
  const basePrice = parseFloat(currentItem.price);
  const unitPrice = basePrice + mod;

  const existing = cart.find(i => i.id === currentItem.id && i.sizeId === sizeId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...currentItem, sizeId, sizeText, quantity: qty, unitPrice });
  }

  closeModal();
  renderCart();
}

payment.js

// payment.js
import { cart, renderCart } from './cart.js';

export function checkout() {
  if (!cart.length) return alert("Cart is empty.");

  const isGuest = localStorage.getItem("isGuest") === "true";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isGuest) {
    alert("🔐 Please login to checkout.");
    window.location.href = "login2.html";
    return;
  }

  if (isLoggedIn) {
    fetch('http://localhost/SOFTENG2/backend/api/index2.php/check_login', {
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 401) {
          alert("Session expired. Please log in again.");
          window.location.href = 'login2.html';
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        if (!data.status) {
          alert("Login required.");
          window.location.href = 'login2.html';
        }

        const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        showPaymentModal(total);
      });
  } else {
    window.location.href = 'login2.html';
  }
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
  const amount = parseFloat(document.getElementById('cashInput').value);
  const type = document.getElementById('paymentType').value;
  const final = window.paymentData.final;

  if (isNaN(amount) || amount < final) {
    alert("Not enough money!");
    return;
  }

  const change = amount - final;

  fetch('http://localhost/SOFTENG2/backend/api/index2.php/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      type: type,
      amountPaid: amount,
      total: window.paymentData.total,
      discount: window.paymentData.discount,
      finalAmount: final
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Payment successful!") {
        alert("✅ Payment successful! Change: ₱" + change.toFixed(2));
        cart.length = 0;
        renderCart();
        closePaymentModal();

        showReceipt({ ...window.paymentData, paid: amount, change, order_id: data.orderId, date: new Date().toLocaleString() });

        fetch(`http://localhost/SOFTENG2/backend/api/index2.php/receipt?orderId=${data.orderId}`, {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(pdf => {
            if (pdf.url) window.open(pdf.url, '_blank');
            else alert("⚠️ Receipt PDF not found.");
          });
      } else {
        alert("⚠️ Payment failed.");
      }
    })
    .catch(err => alert("❌ Payment failed: " + err));
}

function showReceipt(data) {
  const win = window.open('', '', 'width=600,height=800');
  win.document.write(`
    <html><head><title>Receipt</title></head><body>
    <h2>Starbucks Receipt</h2>
    <p><strong>Order ID:</strong> ${data.order_id}</p>
    <p><strong>Total:</strong> ₱${data.total.toFixed(2)}</p>
    <p><strong>Final:</strong> ₱${data.final.toFixed(2)}</p>
    <p><strong>Paid:</strong> ₱${data.paid.toFixed(2)}</p>
    <p><strong>Change:</strong> ₱${data.change.toFixed(2)}</p>
    <p><strong>Date:</strong> ${data.date}</p>
    <button onclick="window.print()">Print</button>
    </body></html>
  `);
  win.document.close();
}

session.js 


// session.js
let sizes = [];

export function loadSizes() {
  fetch('http://localhost/SOFTENG2/backend/api/index2.php/sizes', {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      sizes = data;
      console.log('Loaded sizes:', sizes);
    })
    .catch(err => console.error('Could not load sizes:', err));
}

export function checkLoginOnLoad() {
  if (localStorage.getItem("isGuest")) return;

  fetch('http://localhost/SOFTENG2/backend/api/index2.php/check_login', {
    credentials: 'include'
  })
    .then(res => {
      if (res.status === 401) {
        window.location.href = 'login2.html';
        throw new Error("Not logged in");
      }
      return res.json();
    })
    .then(data => {
      if (!data.status) {
        window.location.href = 'login2.html';
      }
    })
    .catch(err => console.warn("Login check failed:", err));
}

export function getSizes() {
  return sizes;
}

