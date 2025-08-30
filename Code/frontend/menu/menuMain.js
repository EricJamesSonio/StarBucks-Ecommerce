import '../login/js/auth.js';
import { API_BASE_PATH, IMAGES_BASE_PATH } from '../js/config.js';

class MenuManager {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.suggestionsBox = document.getElementById('suggestionsBox');
    this.itemList = document.getElementById('itemList');
    this.searchTimeout = null;

    this.currentCategoryId = 0;
    this.currentCategoryItems = []; // store currently loaded items
    this.initSearch();
    this.initGlobalClick();
    this.initLogout();
  }

  async setCategory(categoryId) {
    this.currentCategoryId = categoryId; // set when user clicks a category
    console.log("Selected category:", categoryId);

    try {
      const res = await fetch(`${API_BASE_PATH}/items?category_id=${categoryId}`, {
        credentials: 'include'
      });
      const json = await res.json();
      if (json.status) {
        this.displayItemsForSearch(json.data);
      }
    } catch (err) {
      console.error('Error fetching category items:', err);
    }
  }

  getCurrentCategoryId() {
    return this.currentCategoryId || 0;
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
    this.suggestionsBox.innerHTML = '';

    const catId = this.getCurrentCategoryId();
    let dataToSearch = [];

    if (catId > 0) {
      // Search via backend with category filter
      try {
        const res = await fetch(`${API_BASE_PATH}/items?category_id=${catId}&query=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        const json = await res.json();
        if (json.status && json.data.length > 0) dataToSearch = json.data;
      } catch (err) {
        console.error('Category search error:', err);
      }
    } else {
      // Global search via backend
      try {
        const res = await fetch(`${API_BASE_PATH}/search?query=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        const json = await res.json();
        if (json.status && json.data.length > 0) dataToSearch = json.data;
      } catch (err) {
        console.error('Search error:', err);
      }
    }

    // Optional: filter by query text in case backend returned extra results
    const filteredData = dataToSearch.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

    if (filteredData.length > 0) {
      filteredData.forEach(item => this.addSuggestion(item));
      this.suggestionsBox.style.display = 'block';
    } else {
      this.suggestionsBox.style.display = 'none';
    }
  }

  // Display items and store them for search
  displayItemsForSearch(items) {
    this.currentCategoryItems = items; // store loaded items
    this.itemList.innerHTML = '';

    items.forEach(item => {
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
    });
  }

  resetCategory() {
    this.currentCategoryId = 0;
    this.currentCategoryItems = [];
    console.log("Category reset to all");
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
window.menu = new MenuManager(); // expose instance globally
