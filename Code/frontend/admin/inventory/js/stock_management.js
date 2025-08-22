class StockManager {
  constructor() {
    if (!window.API_BASE_PATH) {
      throw new Error("API_BASE_PATH is not defined. Ensure config.js is loaded before stock_management.js");
    }

    this.basePath = window.API_BASE_PATH.replace(/\/+$/, '');
    this.API_ITEMS = `${this.basePath}/items`;

    this.itemSelect = document.getElementById("itemSelect");
    this.sizeSelect = document.getElementById("sizeSelect");
    this.addStockForm = document.getElementById("addStockForm");
    this.searchInput = document.getElementById("searchInput");
    this.suggestionsBox = document.getElementById("suggestionsBox");
    this.stocksContainer = document.getElementById("stocksContainer");
    this.btnRefreshStocks = document.getElementById("btnRefreshStocks");

    this.searchTimeout = null;
  }

  /*********************
   * Initialization
   *********************/
  async init() {
    await this.loadItems();
    await this.loadAllStocks();
    
    this.bindEvents();
  }

  /*********************
   * Helpers
   *********************/
  escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  showMessage(text, type = "success") {
    let msg = document.createElement("div");
    msg.className = `alert ${type}`;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  /*********************
   * Data Loading
   *********************/
  async loadItems() {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=getAll`, { credentials: 'include' });
      const result = await res.json();
      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid items data");
      
      this.itemSelect.innerHTML = '<option value="">Select Item</option>' + 
        result.data.map(item => `<option value="${item.id}">${this.escapeHtml(item.name)}</option>`).join("");
    } catch (err) {
      console.error("Error loading items:", err);
      this.showMessage("Error loading items", "error");
    }
  }

  async loadSizesForItem(itemId) {
    try {
      const res = await fetch(`${this.basePath}/sizes?item_id=${encodeURIComponent(itemId)}`, { credentials: 'include' });
      const result = await res.json();

      if (result?.status && Array.isArray(result.data) && result.data.length > 0) {
        this.sizeSelect.innerHTML = '<option value="">Select Size</option>' + 
          result.data.map(size => `<option value="${size.id}">${this.escapeHtml(size.name)}</option>`).join("");
      } else {
        this.sizeSelect.innerHTML = '<option value="">No sizes available</option>';
      }
    } catch (err) {
      console.warn("Sizes API failed for item", itemId, err);
      this.sizeSelect.innerHTML = '<option value="">No sizes available</option>';
    }
  }

  async loadAllStocks() {
    try {
      const response = await fetch(`${this.API_ITEMS}?action=getStocksWithIds`, { credentials: 'include' });
      const data = await response.json();

      if (!data.status) {
        console.error("Failed to load stocks:", data.message);
        this.stocksContainer.innerHTML = `<div class="stock-empty">Failed to load stocks</div>`;
        return;
      }

      const stocks = data.data;
      this.renderStocks(stocks);
    } catch (error) {
      console.error("Error loading all stocks:", error);
      this.stocksContainer.innerHTML = `<div class="stock-empty">Error loading stocks</div>`;
    }
  }


  /*********************
   * Rendering
   *********************/
  renderStocks(stocks) {
    if (!stocks || stocks.length === 0) {
      this.stocksContainer.innerHTML = `<div class="stock-empty">No stocks available</div>`;
      return;
    }

    const stocksHtml = `
      <div class="stocks-grid">
        ${stocks.map(stock => `
          <div class="stock-card">
            <h3>${this.escapeHtml(stock.item_name)}</h3>
            <div class="stock-info">
              <span class="stock-size">${this.escapeHtml(stock.size_name || "No size")}</span>
              <span class="stock-quantity ${stock.quantity < 10 ? 'low' : 'normal'}">
                ${stock.quantity} units
              </span>
            </div>
            <div class="stock-actions">
              <button class="btn-update-stock" 
  data-stock-id="${stock.stock_id}" 
  data-item-id="${stock.item_id}" 
  data-size-id="${stock.size_id}">
  Update
</button>

              <button class="btn-remove-stock" data-stock-id="${stock.stock_id}">
                Remove
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    this.stocksContainer.innerHTML = stocksHtml;
  }

  /*********************
   * Stock Operations
   *********************/
  async addStock(payload) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=addStock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const result = await res.json();
      
      if (result.status) {
        this.showMessage(result.message || "Stock added successfully!", "success");
        this.addStockForm.reset();
        this.sizeSelect.innerHTML = '<option value="">Select Size</option>';
        await this.loadAllStocks();
   
      } else {
        this.showMessage(result.message || "Failed to add stock", "error");
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      this.showMessage("Error adding stock", "error");
    }
  }

  async updateStock(stockId, itemId, sizeId) {
    const newQuantity = prompt("Enter new quantity:");
    if (!newQuantity || isNaN(newQuantity) || parseInt(newQuantity) < 0) {
      this.showMessage("Invalid quantity entered", "error");
      return;
    }

    try {
      const res = await fetch(`${this.API_ITEMS}?action=updateStock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

          stock_id: stockId,
  quantity: parseInt(newQuantity)
        }),
        credentials: 'include'
      });
      const result = await res.json();
      
      if (result.status) {
        this.showMessage("Stock updated successfully!", "success");
        await this.loadAllStocks();
        
      } else {
        this.showMessage(result.message || "Failed to update stock", "error");
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      this.showMessage("Error updating stock", "error");
    }
  }

  async removeStock(stockId) {
    if (!confirm("Are you sure you want to remove this stock entry?")) {
      return;
    }

    try {
      const res = await fetch(`${this.API_ITEMS}?action=removeStock&stock_id=${stockId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      const result = await res.json();
      
      if (result.status) {
        this.showMessage("Stock removed successfully!", "success");
        await this.loadAllStocks();
        
      } else {
        this.showMessage(result.message || "Failed to remove stock", "error");
      }
    } catch (err) {
      console.error("Error removing stock:", err);
      this.showMessage("Error removing stock", "error");
    }
  }

  async searchStocks(query) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=searchStocks&query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      const response = await res.json();
      
      if (response.status && Array.isArray(response.data)) {
        this.renderStocks(response.data);
      } else {
        this.stocksContainer.innerHTML = `<div class="stock-empty">No results found</div>`;
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  /*********************
   * Events binding
   *********************/
  bindEvents() {
    // Item selection change - load sizes
    this.itemSelect.addEventListener("change", (e) => {
      const itemId = e.target.value;
      if (itemId) {
        this.loadSizesForItem(itemId);
      } else {
        this.sizeSelect.innerHTML = '<option value="">Select Size</option>';
      }
    });

    // Add stock form submission
    // Add stock form submission
this.addStockForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const itemId = parseInt(this.itemSelect.value);
  const sizeValue = this.sizeSelect.value;
  const sizeId = sizeValue ? parseInt(sizeValue) : null;
  const quantity = parseInt(document.getElementById("stockQuantity").value);

  if (!itemId || !quantity || quantity <= 0) {
    this.showMessage("Please select an item and enter a valid quantity", "error");
    return;
  }

  // If sizes exist in dropdown but user didn’t pick one
  const sizeOptions = [...this.sizeSelect.options].filter(opt => opt.value);
  if (sizeOptions.length > 0 && !sizeId) {
    this.showMessage("Please select a size for this item", "error");
    return;
  }

  const payload = {
    item_id: itemId,
    // only include size_id if one is chosen
    ...(sizeId ? { size_id: sizeId } : {}),
    quantity: quantity
  };

  this.addStock(payload);
});


    // Stock actions delegation
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-update-stock")) {
        const stockId = e.target.dataset.stockId;
        const itemId = e.target.dataset.itemId;
        const sizeId = e.target.dataset.sizeId;
        this.updateStock(stockId, itemId, sizeId);
      }

      if (e.target.classList.contains("btn-remove-stock")) {
        const stockId = e.target.dataset.stockId;
        this.removeStock(stockId);
      }
    });

    // Search functionality
    this.searchInput?.addEventListener('input', () => {
      const query = this.searchInput.value.trim();
      if (query.length < 1) {
        this.loadAllStocks();
        return;
      }
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchStocks(query);
      }, 300);
    });

    // Refresh stocks button
    this.btnRefreshStocks?.addEventListener('click', async () => {
      await this.loadAllStocks();
      
      this.showMessage("Stocks refreshed!", "success");
    });

    // Back button
    document.getElementById("btnBack").addEventListener("click", () => {
      window.location.href = "../inventory.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const manager = new StockManager();
  manager.init();
});
