// menuMain.js
import '../login/js/auth.js';
import { API_BASE_PATH } from '../js/config.js';

window.logout = () => {
  localStorage.clear();
  fetch(`${API_BASE_PATH}/logout`, { 
    credentials: 'include'
  }).then(() => window.location.href = '../../design/home/index.html');
};
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');

let searchTimeout = null;

searchInput?.addEventListener('input', function() {
  const query = this.value.trim();

  if (query.length < 1) {
    suggestionsBox.style.display = 'none';
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetch(`${API_BASE_PATH}/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(response => {
        suggestionsBox.innerHTML = '';
        if (response.status && response.data.length > 0) {
          response.data.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.onclick = () => {
              searchInput.value = item.name;
              suggestionsBox.style.display = 'none';
              // Open modal with item details
              displaySingleItem(item);
            };
            suggestionsBox.appendChild(div);
          });
          suggestionsBox.style.display = 'block';
        } else {
          suggestionsBox.style.display = 'none';
        }
      })
      .catch(err => {
        console.error('Search error:', err);
        suggestionsBox.style.display = 'none';
      });
  }, 300);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.search-container')) {
    suggestionsBox.style.display = 'none';
  }
});

function displaySingleItem(item) {
  const itemList = document.getElementById('itemList');
  itemList.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'item-card';
  card.onclick = () => openModal(item);

  const imageUrl = item.image_url 
    ? `${IMAGES_BASE_PATH}${item.image_url}` 
    : `${IMAGES_BASE_PATH}ClassicCup.png`;

  card.innerHTML = `
    <img src="${imageUrl}" class="item-img" alt="${item.name}">
    <div class="item-name">${item.name}</div>
    <div class="item-description">${item.description || ''}</div>
    <div class="item-price">₱${parseFloat(item.price).toFixed(2)}</div>
  `;

  itemList.appendChild(card);
}
