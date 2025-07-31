// cart.js
export async function fetchCartItems() {
  const res = await fetch('http://localhost/SOFTENG2/backend/api/index2.php/cart', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json(); // array of { item_id, name, price, quantity, … }
}

export function renderCartFromServer(items) {
  const container = document.getElementById('cartItems');
  container.innerHTML = '';

  let total = 0;
  items.forEach(item => {
    const lineTotal = item.quantity * parseFloat(item.price);
    total += lineTotal;

    const sizeLabel = item.size_name ? ` (${item.size_name})` : '';

    const div = document.createElement('div');
    div.textContent = `${item.name}${sizeLabel} x ${item.quantity} = ₱${lineTotal.toFixed(2)}`;
    container.appendChild(div);
  });

  document.getElementById('cartTotal').textContent    = total.toFixed(2);
  document.getElementById('cartDiscount').textContent = '0.00';
}

