class IngredientManager {
  constructor() {
    if (!window.API_BASE_PATH) {
      throw new Error("API_BASE_PATH is not defined. Ensure config.js is loaded before ingredient_management.js");
    }

    this.basePath = window.API_BASE_PATH.replace(/\/+$/, '');
    this.API_INGREDIENTS = `${this.basePath}/ingredients`;

    // DOM elements
    this.ingredientSelect = document.getElementById("ingredientSelect");
    this.unitSelect = document.getElementById("unitSelect");
    this.addIngredientForm = document.getElementById("addIngredientForm"); // For adding stock
    this.newIngredientForm = document.getElementById("newIngredientForm"); // For creating ingredient
    this.ingredientsContainer = document.getElementById("ingredientsContainer");
    this.lowIngredientContainer = document.getElementById("lowIngredientContainer");
    this.btnRefreshIngredients = document.getElementById("btnRefreshIngredients");
  }

  async init() {
    await this.loadIngredients();
    await this.loadCurrentStock();
    await this.loadLowStockAlerts();
    this.bindEvents();
  }

  escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  showMessage(text, type = "success") {
    const msg = document.createElement("div");
    msg.className = `alert ${type}`;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  /*********************
   * Load all ingredients
   *********************/
  async loadIngredients() {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=getAll`, { credentials: 'include' });
      const result = await res.json();
      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid ingredients data");

      this.ingredientSelect.innerHTML = '<option value="">Select Ingredient</option>' +
        result.data.map(ing =>
          `<option value="${ing.id}" data-stock-unit="${ing.stock_unit || ''}">
            ${this.escapeHtml(ing.name)}
          </option>`).join("");

      // Automatically set the unit when ingredient changes
      this.ingredientSelect.addEventListener('change', (e) => {
        const selectedOption = e.target.selectedOptions[0];
        this.unitSelect.value = selectedOption?.dataset.stockUnit || '';
      });
    } catch (err) {
      console.error("Error loading ingredients:", err);
      this.showMessage("Error loading ingredients", "error");
    }
  }

  /*********************
   * Create ingredient
   *********************/
  async createIngredient(payload) {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=createIngredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const result = await res.json();

      if (result.status) {
        this.showMessage(result.message || "Ingredient created successfully!", "success");
        this.newIngredientForm.reset();
        await this.loadIngredients();
        await this.loadCurrentStock();
        await this.loadLowStockAlerts();
      } else {
        this.showMessage(result.message || "Failed to create ingredient", "error");
      }
    } catch (err) {
      console.error("Error creating ingredient:", err);
      this.showMessage("Error creating ingredient", "error");
    }
  }

  /*********************
   * Add stock for existing ingredient
   *********************/
  async addStock(payload) {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=addStock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_id: payload.ingredient_id,
          quantity: payload.quantity_value, // rename quantity_value -> quantity
          unit: payload.quantity_unit       // rename quantity_unit -> unit
        }),
        credentials: 'include'
      });
      const result = await res.json();

      if (result.status) {
        this.showMessage(result.message || "Stock added successfully!", "success");
        this.addIngredientForm.reset();
        await this.loadCurrentStock();
        await this.loadLowStockAlerts();
      } else {
        this.showMessage(result.message || "Failed to add stock", "error");
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      this.showMessage("Error adding stock", "error");
    }
  }

  /*********************
   * Bind events
   *********************/
  bindEvents() {
    // Create ingredient
    this.newIngredientForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("newIngredientName").value.trim();
      const unit = document.getElementById("newIngredientUnit")?.value.trim() || null; // make sure this input/select exists
      const supplierSelect = document.getElementById("newIngredientSupplier");
      const supplierId = supplierSelect ? parseInt(supplierSelect.value) || null : null;

      if (!name) {
        this.showMessage("Please enter a valid ingredient name", "error");
        return;
      }

      const payload = { name, stock_unit: unit, supplier_id: supplierId };
      this.createIngredient(payload);
    });

    // Add stock
    this.addIngredientForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const ingredientId = parseInt(this.ingredientSelect.value);
      const quantity = parseFloat(document.getElementById("stockQuantity").value);
      const unit = this.unitSelect.value;

      if (!ingredientId || !quantity || !unit) {
        this.showMessage("Please select ingredient, quantity, and unit", "error");
        return;
      }

      const payload = {
        ingredient_id: ingredientId,
        quantity_value: quantity,  // JS uses quantity_value -> mapped in addStock
        quantity_unit: unit
      };

      this.addStock(payload);
    });

    // Refresh button
    this.btnRefreshIngredients?.addEventListener('click', async () => {
      await this.loadIngredients();
      await this.loadCurrentStock();
      await this.loadLowStockAlerts();
      this.showMessage("Ingredients refreshed!", "success");
    });
  }

  /*********************
   * Load current stock
   *********************/
  async loadCurrentStock() {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=getStock`, { credentials: 'include' });
      const result = await res.json();

      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid stock data");

      if (!this.ingredientsContainer) return;

      if (result.data.length === 0) {
        this.ingredientsContainer.innerHTML = `<div class="ingredient-empty">No ingredient stock available</div>`;
        return;
      }

      this.ingredientsContainer.innerHTML = result.data.map(item => `
        <div class="ingredient-item">
          <strong>${this.escapeHtml(item.name)}</strong>: ${item.quantity_in_stock} ${item.stock_unit || ''}
        </div>
      `).join("");
    } catch (err) {
      console.error("Error loading current stock:", err);
      this.showMessage("Error loading current stock", "error");
    }
  }

  /*********************
   * Load low stock alerts
   *********************/
  async loadLowStockAlerts() {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=getLowStock`, { credentials: 'include' });
      const result = await res.json();

      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid low stock data");

      if (!this.lowIngredientContainer) return;

      if (result.data.length === 0) {
        this.lowIngredientContainer.innerHTML = `<div class="ingredient-empty">No low stock alerts</div>`;
        return;
      }

      this.lowIngredientContainer.innerHTML = result.data.map(item => `
        <div class="ingredient-item alert-low">
          ⚠️ <strong>${this.escapeHtml(item.name)}</strong>: ${item.quantity_in_stock} ${item.stock_unit || ''} left
        </div>
      `).join("");
    } catch (err) {
      console.error("Error loading low stock alerts:", err);
      this.showMessage("Error loading low stock alerts", "error");
    }
  }
}

document.getElementById("btnBack").addEventListener("click", () => {
      window.location.href = "../inventory.html";
    });
  

document.addEventListener("DOMContentLoaded", () => {
  const manager = new IngredientManager();
  manager.init();
});
