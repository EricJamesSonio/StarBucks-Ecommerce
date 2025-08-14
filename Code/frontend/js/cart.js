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
        this.totalElem = document.getElementById(totalId);
        this.discountElem = document.getElementById(discountId);
    }

    render(items) {
        this.container.innerHTML = '';

        let total = 0;

        items.forEach(item => {
            const lineTotal = item.quantity * parseFloat(item.price || 0);
            total += lineTotal;

            const sizeLabel = item.size_name ? ` (${item.size_name})` : '';

            const div = document.createElement('div');
            div.textContent = `${item.name}${sizeLabel} x ${item.quantity} = ₱${lineTotal.toFixed(2)}`;
            this.container.appendChild(div);
        });

        this.totalElem.textContent = total.toFixed(2);
        this.discountElem.textContent = '0.00';
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
}

// ===== Initialization =====
const cartService = new CartService(API_BASE_PATH);
const cartUI = new CartUI('cartItems', 'cartTotal', 'cartDiscount');
export const cartController = new CartController(cartService, cartUI);

// Keep original functions for compatibility
export function fetchCartItems() {
    return cartService.fetchCartItems();
}

export function renderCartFromServer(items) {
    cartUI.render(items);
}
