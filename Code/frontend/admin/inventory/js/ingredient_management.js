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

    // Update form elements
    this.updateIngredientForm = document.getElementById("updateIngredientForm");
    this.updateIngredientId = document.getElementById("updateIngredientId");
    this.updateIngredientName = document.getElementById("updateIngredientName");
    this.updateIngredientUnit = document.getElementById("updateIngredientUnit");
    this.cancelUpdateBtn = document.getElementById("cancelUpdate");
  }

  async init() {
    await this.loadIngredients();
    await this.loadCurrentStock();
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
          quantity: payload.quantity_value,
          unit: payload.quantity_unit
        }),
        credentials: 'include'
      });
      const result = await res.json();

      if (result.status) {
        this.showMessage(result.message || "Stock added successfully!", "success");
        this.addIngredientForm.reset();
        await this.loadCurrentStock();
      } else {
        this.showMessage(result.message || "Failed to add stock", "error");
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      this.showMessage("Error adding stock", "error");
    }
  }

  async searchIngredients(query) {
  try {
    const res = await fetch(`${this.API_INGREDIENTS}?action=search&query=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    const result = await res.json();

    if (result.status && Array.isArray(result.data) && result.data.length > 0) {
      this.ingredientsContainer.innerHTML = result.data.map(item => `
        <div class="ingredient-item" data-id="${item.id}">
          <strong>${this.escapeHtml(item.name)}</strong>: ${item.quantity_in_stock} ${item.stock_unit || ''}
          <button class="btn-edit" data-id="${item.id}" data-name="${this.escapeHtml(item.name)}" data-unit="${item.stock_unit || ''}">Edit</button>
          <button class="btn-remove" data-id="${item.id}">Remove</button>
        </div>
      `).join("");
    } else {
      this.ingredientsContainer.innerHTML = `<div class="ingredient-empty">No ingredients found</div>`;
    }
  } catch (err) {
    console.error("Search error:", err);
    this.showMessage("Error searching ingredients", "error");
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
      const unit = document.getElementById("newIngredientUnit")?.value.trim() || null;
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
        quantity_value: quantity,
        quantity_unit: unit
      };

      this.addStock(payload);
    });

    // Refresh button
    this.btnRefreshIngredients?.addEventListener('click', async () => {
      await this.loadIngredients();
      await this.loadCurrentStock();
      this.showMessage("Ingredients refreshed!", "success");
    });

    // Remove ingredient
    this.ingredientsContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("btn-remove")) {
        const id = parseInt(e.target.dataset.id);
        if (confirm("Are you sure you want to remove this ingredient?")) {
          await this.removeIngredient(id);
        }
      }

      // Update ingredient
      if (e.target.classList.contains("btn-edit")) {
        const id = parseInt(e.target.dataset.id);
        const name = e.target.dataset.name;
        const unit = e.target.dataset.unit || '';

        // Show update form
        this.updateIngredientForm.style.display = "block";
        this.updateIngredientId.value = id;
        this.updateIngredientName.value = name;
        this.updateIngredientUnit.value = unit;
      }
    });

  const searchInput = document.getElementById("ingredientSearch");
searchInput?.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (!query) {
    this.loadCurrentStock(); // reload all ingredients
    return;
  }

  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    this.searchIngredients(query);
  }, 300); // small delay to reduce requests
});


    // Modal elements
const modal = document.getElementById("updateIngredientModal");
const closeModal = document.getElementById("closeUpdateModal");
const cancelUpdateBtn = document.getElementById("cancelUpdate");

// Open modal when edit clicked
this.ingredientsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const id = parseInt(e.target.dataset.id);
    const name = e.target.dataset.name;
    const unit = e.target.dataset.unit || '';

    document.getElementById("updateIngredientId").value = id;
    document.getElementById("updateIngredientName").value = name;
    document.getElementById("updateIngredientUnit").value = unit;

    modal.style.display = "block";
  }

  if (e.target.classList.contains("btn-remove")) {
    const id = parseInt(e.target.dataset.id);
    if (confirm("Are you sure you want to remove this ingredient?")) {
      this.removeIngredient(id);
    }
  }
});

// Close modal when clicking X
closeModal.addEventListener("click", () => modal.style.display = "none");

// Close modal when clicking cancel
cancelUpdateBtn.addEventListener("click", () => modal.style.display = "none");

// Close modal when clicking outside modal content
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Submit update form
document.getElementById("updateIngredientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = parseInt(document.getElementById("updateIngredientId").value);
  const name = document.getElementById("updateIngredientName").value.trim();
  const unit = document.getElementById("updateIngredientUnit").value;

  if (!name || !unit) {
    this.showMessage("Please fill in all fields", "error");
    return;
  }

  await this.updateIngredient({ id, name, stock_unit: unit });
  modal.style.display = "none"; // Close modal after update
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
        <div class="ingredient-item" data-id="${item.id}">
          <strong>${this.escapeHtml(item.name)}</strong>: ${item.quantity_in_stock} ${item.stock_unit || ''}
          <button class="btn-edit" data-id="${item.id}" data-name="${this.escapeHtml(item.name)}" data-unit="${item.stock_unit || ''}">Edit</button>
          <button class="btn-remove" data-id="${item.id}">Remove</button>
        </div>
      `).join("");
    } catch (err) {
      console.error("Error loading current stock:", err);
      this.showMessage("Error loading current stock", "error");
    }
  }

  // Update ingredient
  async updateIngredient(payload) {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=updateIngredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      const result = await res.json();
      this.showMessage(result.message || (result.status ? "Ingredient updated!" : "Failed to update"), result.status ? "success" : "error");
      await this.loadIngredients();
      await this.loadCurrentStock();
    } catch (err) {
      console.error("Error updating ingredient:", err);
      this.showMessage("Error updating ingredient", "error");
    }
  }

  // Remove ingredient
  async removeIngredient(ingredientId) {
    try {
      const res = await fetch(`${this.API_INGREDIENTS}?action=removeIngredient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ingredientId }),
        credentials: 'include'
      });
      const result = await res.json();
      this.showMessage(result.message || (result.status ? "Ingredient removed!" : "Failed to remove"), result.status ? "success" : "error");
      await this.loadIngredients();
      await this.loadCurrentStock();
    } catch (err) {
      console.error("Error removing ingredient:", err);
      this.showMessage("Error removing ingredient", "error");
    }
  }
}

// Back button
document.getElementById("btnBack").addEventListener("click", () => {
  window.location.href = "../inventory.html";
});

// Initialize manager
document.addEventListener("DOMContentLoaded", () => {
  window.manager = new IngredientManager();
  manager.init();
});
