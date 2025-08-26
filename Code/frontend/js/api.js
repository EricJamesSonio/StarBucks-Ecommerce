import { openModal } from './modal.js';
import { API_BASE_PATH, IMAGES_BASE_PATH } from './config.js';

// =========================
// ImageManager
// =========================
class ImageManager {
    constructor(basePath) {
        this.basePath = basePath;
    }

    getImage(imageUrl) {
        // Use the image_url from the database; fallback if missing
        return imageUrl ? this.basePath + imageUrl : this.basePath + "ClassicCup.png";
    }
}

// =========================
// CategoryService
// =========================
class CategoryService {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
    }

    async fetchTopSelling() {
        const res = await fetch(`${this.apiBasePath}/topselling`, { credentials: 'include' });
        return res.json();
    }

    async fetchSubcategories(categoryId) {
        const res = await fetch(`${this.apiBasePath}/subcategories?category_id=${categoryId}`, { credentials: 'include' });
        return res.json();
    }

    async fetchItemsBySubcategory(subcategoryId) {
        const res = await fetch(`${this.apiBasePath}/items?subcategory_id=${subcategoryId}`, { credentials: 'include' });
        return res.json();
    }

    async fetchMerchandiseBySubcategory(subcategoryId) {
        const res = await fetch(`${this.apiBasePath}/merchandise?subcategory_id=${subcategoryId}`, { credentials: 'include' });
        return res.json();
    }

    async fetchCategories() {
        const res = await fetch(`${this.apiBasePath}/categories`, { credentials: 'include' });
        return res.json();
    }
}

// =========================
// CategoryUI
// =========================
class CategoryUI {
    constructor(imageManager) {
        this.imageManager = imageManager;
    }

    showCategories() {
        document.getElementById('categorySelect').style.display = 'block';
        document.getElementById('subcategorySelect').style.display = 'none';
        document.getElementById('itemList').innerHTML = '';
        document.getElementById('backButton').style.display = 'none';
    }

    showSubcategorySection(loadingText = 'Loading...') {
        document.getElementById('subcategorySelect').style.display = 'block';
        document.getElementById('subcategoryButtons').innerHTML = loadingText;
        document.getElementById('itemList').innerHTML = '';
    }

    displayTopSelling(items) {
        const ul = document.querySelector('#foodSelection ul');
        if (!ul) return;

        const top4 = items.slice(0, 4);
        ul.innerHTML = top4.map(item => `
            <li class="prodInfo">
              <div class="contents">
                <img src="${this.imageManager.getImage(item.image_url)}" alt="${item.name}" class="item-image" />
                <h2>${item.name}</h2>
                <p>₱${parseFloat(item.price).toFixed(2)}</p>
                <p>Total Sold: ${item.total_sold}</p>
                <button onclick="addToCart()">Add to Cart</button>
              </div>
            </li>
        `).join('');
    }

    displaySubcategories(subcategories, onClick) {
        const container = document.getElementById('subcategoryButtons');
        container.innerHTML = '';
        subcategories.forEach(subcat => {
            const btn = document.createElement('button');
            btn.textContent = subcat.name;
            btn.onclick = () => onClick(subcat.id);
            container.appendChild(btn);
        });
    }

    displayItems(items) {
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = '';

        items.forEach(item => {
            const imageUrl = this.imageManager.getImage(item.image_url);
            const card = document.createElement('div');
            card.className = 'item-card';
            card.onclick = () => openModal(item);

            card.innerHTML = `
                <img src="${imageUrl}" class="item-img" alt="${item.name}">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-price">₱${parseFloat(item.price).toFixed(2)}</div>
            `;
            itemList.appendChild(card);
        });
    }

    showError(targetId, message) {
        document.getElementById(targetId).innerHTML = message;
    }
}

// =========================
// CategoryController
// =========================
class CategoryController {
    constructor(service, ui) {
        this.service = service;
        this.ui = ui;
    }

    async loadTopSelling(categoryName) {
        // Get category ID from database
        const catId = await this.getCategoryIdByName(categoryName);
        if (!catId) {
            console.error('Category not found:', categoryName);
            return;
        }

        document.getElementById('categorySelect')?.style.setProperty('display', 'none');
        document.getElementById('backButton')?.style.setProperty('display', 'block');

        try {
            const result = await this.service.fetchTopSelling();
            if (!result.status) throw new Error('No data');
            const byCat = result.data.filter(item => item.category_id == catId);
            this.ui.displayTopSelling(byCat);
        } catch (err) {
            console.error('Could not load top-selling:', err);
        }
    }

    async loadCategory(categoryName) {
        document.getElementById('categorySelect').style.display = 'none';
        document.getElementById('backButton').style.display = 'block';
        document.getElementById('subcategorySelect').style.display = 'none';

        // Get category ID from database
        const catId = await this.getCategoryIdByName(categoryName);
        if (!catId) {
            console.error('Category not found:', categoryName);
            return;
        }
        
        this.loadSubcategories(catId);
    }

    async loadSubcategories(categoryId) {
        this.ui.showSubcategorySection();
        try {
            const result = await this.service.fetchSubcategories(categoryId);
            if (!result.status) throw new Error('No subcategories found');
            
            // Store category ID to determine which API to use later
            this.currentCategoryId = categoryId;
            
            this.ui.displaySubcategories(result.data, (subcatId) => this.loadItemsBySubcategory(subcatId));
        } catch (err) {
            console.error('Could not load subcategories:', err);
            this.ui.showError('subcategoryButtons', 'Failed to load subcategories');
        }
    }

    async loadItemsBySubcategory(subcategoryId) {
        document.getElementById('itemList').innerHTML = 'Loading items...';
        try {
            let result;
            
            // Check if current category is Merchandise (category ID 3) to use correct API
            const categories = await this.service.fetchCategories();
            const merchandiseCategory = categories.data?.find(cat => cat.name === 'Merchandise');
            
            if (this.currentCategoryId === merchandiseCategory?.id) {
                result = await this.service.fetchMerchandiseBySubcategory(subcategoryId);
            } else {
                result = await this.service.fetchItemsBySubcategory(subcategoryId);
            }
            
            if (!result.status) throw new Error('No items found');
            this.ui.displayItems(result.data);
        } catch (err) {
            console.error('Could not load items for subcategory:', err);
            this.ui.showError('itemList', 'Failed to load items');
        }
    }

    async getCategoryIdByName(categoryName) {
        try {
            const result = await this.service.fetchCategories();
            if (!result.status) throw new Error('No categories found');
            
            const category = result.data.find(cat => cat.name === categoryName);
            return category ? category.id : null;
        } catch (err) {
            console.error('Could not fetch categories:', err);
            return null;
        }
    }
}

// =========================
// Initialization
// =========================
const imageManager = new ImageManager(IMAGES_BASE_PATH);
const categoryService = new CategoryService(API_BASE_PATH);
const categoryUI = new CategoryUI(imageManager);
export const categoryController = new CategoryController(categoryService, categoryUI);

// Original exports for backward compatibility
export function loadTopSelling(categoryName) {
    categoryController.loadTopSelling(categoryName);
}
export function loadCategory(categoryName) {
    categoryController.loadCategory(categoryName);
}
export function showCategories() {
    categoryUI.showCategories();
}
export function loadSubcategories(categoryId) {
    categoryController.loadSubcategories(categoryId);
}
