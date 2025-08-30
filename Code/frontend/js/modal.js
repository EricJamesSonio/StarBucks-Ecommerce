// modal.js
import { getSizes, ensureGuestToken } from './session.js';
import { API_BASE_PATH } from './config.js';

class Modal {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
        this.currentItem = null;

        this.modalElement = document.getElementById('itemModal');
        this.nameElement = document.getElementById('modalItemName');
        this.quantityInput = document.getElementById('modalQuantity');
        this.sizeSelect = document.getElementById('modalSize');
    }

    open(item) {
        this.currentItem = item;
        this.nameElement.textContent = item.name;
        this.quantityInput.value = 1;

        this.populateSizes(item.id);
        this.show();
    }

    close() {
        this.hide();
    }

    async populateSizes(itemId) {
        this.sizeSelect.innerHTML = '';
        
        try {
            // Determine item type for size fetching
            const itemType = this.currentItem.category_id === 3 || this.currentItem.item_type === 'merchandise' ? 'merchandise' : 'starbucksitem';
            
            // Fetch sizes specific to this item
            const res = await fetch(`${this.apiBasePath}/sizes?item_id=${itemId}&item_type=${itemType}`, { 
                credentials: 'include' 
            });
            
            if (!res.ok) {
                throw new Error('Failed to fetch sizes');
            }
            
            const response = await res.json();
            
            if (response.status && response.data && response.data.length > 0) {
                // Use item-specific sizes
                response.data.forEach(size => {
                    const opt = document.createElement('option');
                    opt.value = size.id;
                    opt.textContent = `${size.name} (+₱${parseFloat(size.price_modifier).toFixed(2)})`;
                    opt.dataset.modifier = size.price_modifier;
                    this.sizeSelect.appendChild(opt);
                });
            } else {
                // Fallback: show default size only
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'Default Size';
                opt.dataset.modifier = '0.00';
                this.sizeSelect.appendChild(opt);
            }
        } catch (err) {
            console.error('Failed to fetch item sizes:', err);
            // Fallback: show default size only
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Default Size';
            opt.dataset.modifier = '0.00';
            this.sizeSelect.appendChild(opt);
        }
    }

    async initGuestIfNeeded() {
        // Only call backend if guest token not registered yet
        const guestToken = ensureGuestToken();

        try {
            const res = await fetch(`${this.apiBasePath}/init_guest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ guest_token: guestToken })
            });

            if (!res.ok) {
                console.warn('Failed to register guest token:', await res.text());
            }
        } catch (err) {
            console.warn('Could not initialize guest token:', err);
        }

        return guestToken;
    }

    async addToCart() {
        const qty = parseInt(this.quantityInput.value, 10);
        if (qty < 1) return;

        const selectedOption = this.sizeSelect.options[this.sizeSelect.selectedIndex];
        const sizeId = selectedOption.value || null; // Handle empty value for default size
        const mod = parseFloat(selectedOption.dataset.modifier || '0.00');
        const unitPrice = parseFloat(this.currentItem.price) + mod;

        const guestToken = await this.initGuestIfNeeded();

        // Determine item type based on the current item's category or other properties
        const itemType = this.currentItem.category_id === 3 || this.currentItem.item_type === 'merchandise' ? 'merchandise' : 'starbucksitem';

        const payload = {
            item_id: this.currentItem.id,
            item_type: itemType,
            quantity: qty,
            guest_token: guestToken
        };

        // Only add size_id if it's not empty/null
        if (sizeId) {
            payload.size_id = sizeId;
        }

        try {
            const res = await fetch(`${this.apiBasePath}/cart`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            let data = {};
            try { data = await res.json(); } catch { console.warn('No JSON returned from /cart'); }

            if (!res.ok) throw new Error(data.error || data.message || res.statusText);

            alert(`✅ Added ${this.currentItem.name} ×${qty} to your cart.`);
        } catch (err) {
            console.error("Cart sync failed:", err);
            alert(`❌ Could not add to cart: ${err.message}`);
        }

        this.close();
    }

    show() {
        this.modalElement.style.display = 'flex';
    }

    hide() {
        this.modalElement.style.display = 'none';
    }
}

// ===== Singleton Export =====
export const modal = new Modal(API_BASE_PATH);

// Legacy function names
export function openModal(item) { modal.open(item); }
export function closeModal() { modal.close(); }
export async function addToCart() { await modal.addToCart(); }
