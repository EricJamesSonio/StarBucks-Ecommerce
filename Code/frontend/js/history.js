// history.js
import { API_BASE_PATH, IMAGES_BASE_PATH } from './config.js';

class HistoryService {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
    }

    async fetchHistory() {
        const response = await fetch(`${this.apiBasePath}/history`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch history data');
        return response.json();
    }
}

class HistoryUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    renderNoHistory() {
        this.container.innerHTML = "<p>No order history available.</p>";
    }

    renderError() {
        this.container.innerHTML = "<p>Failed to load order history.</p>";
    }

    renderHistory(history) {
        this.container.innerHTML = ''; // Clear old data

        history.forEach(receipt => {
            const div = document.createElement("div");
            div.classList.add("receipt-box");

            // Render items properly with IMAGES_BASE_PATH
            const itemBadges = receipt.items.map(item => {
                const imgPath = item.image_url 
                    ? `${IMAGES_BASE_PATH}/${item.image_url}` 
                    : null;

                return `
                    <div class="receipt-item">
                        ${imgPath ? `<img src="${imgPath}" alt="${item.name}" class="item-img">` : ""}
                        <span>${item.qty} × ${item.name} - ₱${item.price}</span>
                    </div>
                `;
            }).join('');

            div.innerHTML = `
                <h3>Receipt ID: ${receipt.id}</h3>
                <p><strong>Date:</strong> ${receipt.date}</p>
                <div><strong>Items:</strong><br>${itemBadges}</div>
                <p><strong>Total:</strong> ₱${receipt.total}</p>
                <hr>
            `;

            this.container.appendChild(div);
        });
    }
}

class HistoryController {
    constructor(service, ui) {
        this.service = service;
        this.ui = ui;
    }

    async init() {
        try {
            const data = await this.service.fetchHistory();

            if (!data.status || !Array.isArray(data.history) || data.history.length === 0) {
                this.ui.renderNoHistory();
                return;
            }

            this.ui.renderHistory(data.history);
        } catch (error) {
            console.error("Error fetching history:", error);
            this.ui.renderError();
        }
    }
}

// ===== Initialization =====
document.addEventListener("DOMContentLoaded", () => {
    const historyService = new HistoryService(API_BASE_PATH);
    const historyUI = new HistoryUI("history-container");
    const historyController = new HistoryController(historyService, historyUI);

    historyController.init();
});
