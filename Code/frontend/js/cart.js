// cart.js
import { API_BASE_PATH } from './config.js';

class CartService {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
    }

    async fetchCartItems() {
        const res = await fetch(`${this.apiBasePath}/cart`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to load cart");
        return res.json(); // [{ item_id, name, price, quantity, ... }]
    }
}

class CartUI {
    constructor(cartItemsContainerId, totalId, discountId) {
        this.container = document.getElementById(cartItemsContainerId);
        this.totalElem = document.querySelector(`.${totalId}`);
        this.discountElem = document.querySelector(`.${discountId}`);
        this.items = []; // store items here
    }

    render(items) {
        this.items = items; // keep a reference

        this.container.innerHTML = '';

        let total = 0;

        items.forEach((item, index) => {
            const lineTotal = item.quantity * parseFloat(item.price || 0);
            total += lineTotal;

            // create the product UI for each item
            const prodElem = this.createProductElement(item, index);
            this.container.appendChild(prodElem);
        });

        this.totalElem.textContent = total.toFixed(2);
        this.discountElem.textContent = '0.00';
    }

    createProductElement(item, index) {
        const div = document.createElement('div');
        div.className = 'prod';
        div.dataset.index = index; // keep index reference

        div.innerHTML = `
            <input type="checkbox" id="prods">
            <label for="prods" class='prod-label'> 
            <div class="image-checkbox">
                <div class="img">
                    <img src="${item.imgPath || ''}" alt="${item.name}">
                </div>
            </div>
            <div class="prod-info">
                <h2 class="prod-name">${item.name || 'Prod Name'}</h2>
                <div class="prod-att-con">
                    <ul>
                        <li class="prod-att">
                            <span>${item.size_name || ''}</span>
                        </li>
                    </ul>
                </div>
                <span class="prod-price">₱${parseFloat(item.price || 0).toFixed(2)}</span>
            </div>
            <div class="end-config">
                <div class="cross"></div>
                <div class="qty-config">
                    <button class="add-qty">+</button>
                    <span class="qty">${item.quantity || 1}</span>
                    <button class="minus-qty">-</button>        
                </div>
            </div>
            </label>
            <div class="border-bot"></div>
        `;

        return div;
    }

    // 🔹 new method to update qty in data + re-render UI
    updateQuantity(index, newQty) {
        if (newQty >= 1) {
            this.items[index].quantity = newQty;
            this.render(this.items); // refresh UI + totals
            console.log("Before update:", this.items);
            console.log("Updating index", index, "to", newQty);
        }
    }
}



class CartController {
    constructor(service, ui) {
        this.service = service;
        this.ui = ui;
    }

    async loadCart() {
        try {
            const items = await this.service.fetchCartItems();
            this.ui.render(items);
        } catch (err) {
            console.error('Error loading cart:', err);
        }
    }

    updateQuantity(index, qty) {
        this.ui.updateQuantity(index, qty);
    }
}

// ===== Initialization =====
const cartService = new CartService(API_BASE_PATH);
const cartUI = new CartUI('cart-container', 'cartTotal', 'cartDiscount');
export const cartController = new CartController(cartService, cartUI);

// Keep original functions for compatibility
export function fetchCartItems() {
    return cartService.fetchCartItems();
}

export function renderCartFromServer(items) {
    cartUI.render(items);
};
