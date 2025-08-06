import { getSizes, ensureGuestToken } from './session.js';

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

export async function addToCart() {
  const qty = parseInt(document.getElementById('modalQuantity').value, 10);
  if (qty < 1) return;

  const sizeSelect = document.getElementById('modalSize');
  const sizeId   = sizeSelect.value;
  const sizeText = sizeSelect.options[sizeSelect.selectedIndex].text;
  const mod      = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].dataset.modifier);
  const basePrice = parseFloat(currentItem.price);
  const unitPrice = basePrice + mod;

  // Build a payload for your API
const payload = {
  item_id: currentItem.id,
  size_id: sizeId,
  quantity: qty,
  guest_token: ensureGuestToken() // ✅ attach this
};
  try {
    const res = await fetch('http://localhost/SOFTENG2/backend/api/index2.php/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || res.statusText);

    alert(`✅ Added ${currentItem.name} ×${qty} to your cart.`);
  } catch (err) {
    console.error("Cart sync failed:", err);
    alert("❌ Could not add to cart: " + err.message);
  }

  closeModal();
}
