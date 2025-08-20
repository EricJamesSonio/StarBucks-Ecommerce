// menuMain.js
import '../login/js/auth.js';
import { API_BASE_PATH, IMAGES_BASE_PATH } from '../js/config.js';

class MenuManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.suggestionsBox = document.getElementById('suggestionsBox');
    this.itemList = document.getElementById('itemList');
    this.searchTimeout = null;

    this.initSearch();
    this.initGlobalClick();
    this.initLogout();
  }

  initLogout() {
    window.logout = () => {
      localStorage.clear();
      fetch(`${API_BASE_PATH}/logout`, { credentials: 'include' })
        .then(() => window.location.href = '../../design/home/index.html');
    };
  }

  initSearch() {
    this.searchInput?.addEventListener('input', () => this.handleSearchInput());
  }

  initGlobalClick() {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.search-container')) {
        this.suggestionsBox.style.display = 'none';
      }
    });
  }

  handleSearchInput() {
    const query = this.searchInput.value.trim();
    if (query.length < 1) {
      this.suggestionsBox.style.display = 'none';
      return;
    }

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.performSearch(query), 300);
  }

  async performSearch(query) {
    try {
      const res = await fetch(`${API_BASE_PATH}/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      const response = await res.json();

      this.suggestionsBox.innerHTML = '';
      if (response.status && response.data.length > 0) {
        response.data.forEach(item => this.addSuggestion(item));
        this.suggestionsBox.style.display = 'block';
      } else {
        this.suggestionsBox.style.display = 'none';
      }
    } catch (err) {
      console.error('Search error:', err);
      this.suggestionsBox.style.display = 'none';
    }
  }

  addSuggestion(item) {
    const div = document.createElement('div');
    div.textContent = item.name;
    div.onclick = () => {
      this.searchInput.value = item.name;
      this.suggestionsBox.style.display = 'none';
      this.displaySingleItem(item);
    };
    this.suggestionsBox.appendChild(div);
  }

  displaySingleItem(item) {
    this.itemList.innerHTML = '';

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

    this.itemList.appendChild(card);
  }
}

// Initialize
new MenuManager();
