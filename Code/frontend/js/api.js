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

    async fetchAllItemsByCategory(categoryId) {
        const res = await fetch(`${this.apiBasePath}/items?category_id=${categoryId}`, { credentials: 'include' });
        return res.json();
    }

    async fetchMerchandiseBySubcategory(subcategoryId) {
        const res = await fetch(`${this.apiBasePath}/merchandise?subcategory_id=${subcategoryId}`, { credentials: 'include' });
        return res.json();
    }

    async fetchAllMerchandiseByCategory(categoryId) {
        const res = await fetch(`${this.apiBasePath}/merchandise?category_id=${categoryId}`, { credentials: 'include' });
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
        document.getElementById('subcategorySection').style.display = 'none';
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('itemList').innerHTML = '';
    }

    showSubcategorySection(loadingText = 'Loading...') {
        document.getElementById('subcategorySection').style.display = 'block';
        document.getElementById('subcategoryButtons').innerHTML = loadingText;
        document.getElementById('itemList').innerHTML = '';
        document.getElementById('backButton').style.display = 'block';
    }

    displayTopSelling(items) {
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = '<h2>Top Selling Items</h2>';
        
        const top4 = items.slice(0, 4);
        top4.forEach(item => {
            const imageUrl = this.imageManager.getImage(item.image_url);
            const card = document.createElement('div');
            card.className = 'item-card';
            card.onclick = () => openModal(item);

            card.innerHTML = `
                <img src="${imageUrl}" class="item-img" alt="${item.name}">
                <div class="item-name">${item.name}</div>
                <div class="item-price">₱${parseFloat(item.price).toFixed(2)}</div>
                <div>Total Sold: ${item.total_sold}</div>
            `;
            itemList.appendChild(card);
        });
    }

    displaySubcategories(subcategories, onClick) {
        const container = document.getElementById('subcategoryButtons');
        container.innerHTML = '';
        
        // Add subcategory buttons only (no "View All" button)
        subcategories.forEach(subcat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = subcat.name;
            btn.onclick = () => onClick(subcat.id);
            container.appendChild(btn);
        });
    }

    displayItems(items, subcategoryName = '') {
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = '';

        if (items.length === 0) {
            itemList.innerHTML = '<p>No items found in this category.</p>';
            return;
        }

        // Add subcategory title if provided
        if (subcategoryName) {
            const title = document.createElement('h2');
            title.className = 'subcategory-title';
            title.textContent = subcategoryName;
            itemList.appendChild(title);
        }

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

    displayItemsGroupedBySubcategory(items, subcategories) {
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = '';

        if (items.length === 0) {
            itemList.innerHTML = '<p>No items found in this category.</p>';
            return;
        }

        // Group items by subcategory_id
        const itemsBySubcategory = {};
        items.forEach(item => {
            if (!itemsBySubcategory[item.subcategory_id]) {
                itemsBySubcategory[item.subcategory_id] = [];
            }
            itemsBySubcategory[item.subcategory_id].push(item);
        });

        // Create sections for each subcategory
        subcategories.forEach(subcat => {
            const subcatItems = itemsBySubcategory[subcat.id] || [];
            
            if (subcatItems.length > 0) {
                // Create subcategory header
                const subcatHeader = document.createElement('h2');
                subcatHeader.className = 'subcategory-title';
                subcatHeader.textContent = subcat.name;
                itemList.appendChild(subcatHeader);

                // Create container for items in this subcategory
                const subcatContainer = document.createElement('div');
                subcatContainer.className = 'subcategory-items';
                
                // Add items to the container
                subcatItems.forEach(item => {
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
                    subcatContainer.appendChild(card);
                });
                
                itemList.appendChild(subcatContainer);
            }
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

        document.getElementById('backButton').style.display = 'block';

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
        document.getElementById('backButton').style.display = 'block';

        // Get category ID from database
        const catId = await this.getCategoryIdByName(categoryName);
        if (!catId) {
            console.error('Category not found:', categoryName);
            return;
        }
        
        // Show subcategory section and load subcategories
        this.ui.showSubcategorySection();
        
        try {
            const result = await this.service.fetchSubcategories(catId);
            if (!result.status) throw new Error('No subcategories found');
            
            // Store category ID to determine which API to use later
            this.currentCategoryId = catId;
            
            // Display subcategory buttons
            this.ui.displaySubcategories(result.data, (subcatId) => {
                // Find the subcategory name for the title
                const subcategory = result.data.find(subcat => subcat.id === subcatId);
                this.loadItemsBySubcategory(subcatId, subcategory ? subcategory.name : '');
            });
            
            // Also load all items for this category (grouped by subcategory)
            this.loadAllItemsByCategory(catId, result.data);
            
        } catch (err) {
            console.error('Could not load subcategories:', err);
            this.ui.showError('subcategoryButtons', 'Failed to load subcategories');
        }
    }

    async loadItemsBySubcategory(subcategoryId, subcategoryName = '') {
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
            this.ui.displayItems(result.data, subcategoryName);
        } catch (err) {
            console.error('Could not load items for subcategory:', err);
            this.ui.showError('itemList', 'Failed to load items');
        }
    }

    async loadAllItemsByCategory(categoryId, subcategories) {
        document.getElementById('itemList').innerHTML = 'Loading all items...';
        try {
            let result;
            
            // Check if category is Merchandise to use correct API
            const categories = await this.service.fetchCategories();
            const merchandiseCategory = categories.data?.find(cat => cat.name === 'Merchandise');
            
            if (categoryId === merchandiseCategory?.id) {
                result = await this.service.fetchAllMerchandiseByCategory(categoryId);
            } else {
                result = await this.service.fetchAllItemsByCategory(categoryId);
            }
            
            if (!result.status) throw new Error('No items found');
            
            // Display items grouped by subcategory
            this.ui.displayItemsGroupedBySubcategory(result.data, subcategories);
        } catch (err) {
            console.error('Could not load items for category:', err);
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
export function loadAllItemsByCategory(categoryId) {
    // This function now requires subcategories data, so we need to handle it differently
    console.warn("loadAllItemsByCategory requires subcategories data. Use loadCategory instead.");
}

// Make functions globally available
window.loadTopSelling = function(categoryName) {
    categoryController.loadTopSelling(categoryName);
};

window.loadCategory = function(categoryName) {
    categoryController.loadCategory(categoryName);
};

window.showCategories = function() {
    categoryUI.showCategories();
};

// Initialize menu object if not already defined
window.menu = window.menu || {
    setCategory: function(id) { 
        this.currentCategoryId = id; 
        console.log('Category set to:', id);
    },
    resetCategory: function() { 
        this.currentCategoryId = null; 
        console.log('Category reset');
    },
    currentCategoryId: null
};