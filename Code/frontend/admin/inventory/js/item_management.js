class ItemManager {
  constructor() {
    if (!window.API_BASE_PATH) {
      throw new Error("API_BASE_PATH is not defined. Ensure config.js is loaded before item_management.js");
    }

    this.basePath = window.API_BASE_PATH.replace(/\/+$/, '');
    this.API_ITEMS = `${this.basePath}/items`;

    this.categorySelect = document.getElementById("categorySelect");
    this.subcategorySelect = document.getElementById("subcategorySelect");
    this.itemTableBody = document.querySelector("#itemTable tbody");
    this.addItemForm = document.getElementById("addItemForm");
    this.searchInput = document.getElementById("searchInput");
    this.suggestionsBox = document.getElementById("suggestionsBox");


    this.searchTimeout = null;
  }

  /*********************
   * Initialization
   *********************/
  async init() {
    await this.loadCategories();
    const firstCat = this.categorySelect.options[0]?.value;
    if (firstCat) await this.loadSubcategories(firstCat);
    await this.loadItems();
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
   * Loaders (Categories / Subcategories / Items / Sizes)
   *********************/
  async loadCategories() {
    try {
      const res = await fetch(`${this.basePath}/categories`, { credentials: 'include' });
      const result = await res.json();
      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid categories data");
      this.categorySelect.innerHTML = result.data.map(cat => `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`).join("");
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

  async loadSubcategories(categoryId) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=getSubcategories&category_id=${encodeURIComponent(categoryId)}`, { credentials: 'include' });
      const result = await res.json();
      if (!result || result.status === false || !Array.isArray(result.data)) throw new Error('Invalid subcategories data');
      this.subcategorySelect.innerHTML = result.data.map(sc => `<option value="${sc.id}">${this.escapeHtml(sc.name)}</option>`).join("");
    } catch (err) {
      console.error("Error loading subcategories:", err);
      this.subcategorySelect.innerHTML = `<option value="0">--</option>`;
    }
  }

  async loadItems() {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=getAll`, { credentials: 'include' });
      const result = await res.json();
      if (!result.status || !Array.isArray(result.data)) throw new Error("Invalid items data");
      this.renderItems(result.data);
    } catch (err) {
      console.error("Error loading items:", err);
    }
  }


  /*********************
   * Rendering
   *********************/
  renderItems(items) {
    this.itemTableBody.innerHTML = items.map(item => `
      <tr data-id="${item.id}">
        <td><input value="${this.escapeHtml(item.name || '')}" class="edit-name"></td>
        <td><input type="number" value="${item.price ?? 0}" step="0.01" class="edit-price"></td>
        <td>${this.escapeHtml(item.category_name || '')}</td>
        <td>${this.escapeHtml(item.subcategory_name || '')}</td>
        <td><textarea class="edit-desc">${this.escapeHtml(item.description || "")}</textarea></td>
        <td>
          <button class="btnUpdate">Update</button>
          <button class="btnDelete">Delete</button>
        </td>
      </tr>
    `).join("");
  }

  /*********************
   * CRUD / Stock API calls
   *********************/
  async addItem(data) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      // Check if response is ok first
      if (!res.ok) {
        console.error(`HTTP Error: ${res.status} ${res.statusText}`);
        this.showMessage(`Server error: ${res.status}`, "error");
        return;
      }

      // Check if response has content before parsing JSON
      const responseText = await res.text();
      if (!responseText) {
        console.error("Empty response from server");
        this.showMessage("Empty response from server", "error");
        return;
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Invalid JSON response:", responseText);
        this.showMessage("Invalid server response", "error");
        return;
      }

      if (result.status) {
        this.showMessage("Item added successfully!", "success");
        this.addItemForm.reset();
        this.loadItems();
      } else {
        this.showMessage(result.message || "Failed to add item", "error");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      this.showMessage("Network error adding item", "error");
    }
  }

  async updateItem(data) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const result = await res.json();
      if (result.status) {
        this.showMessage("Item updated successfully!", "success");
        this.loadItems();
      } else {
        this.showMessage(result.message || "Failed to update item", "error");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      this.showMessage("Error updating item", "error");
    }
  }


  async deleteItem(id) {
  try {
    const res = await fetch(
      `${this.API_ITEMS}?action=delete&id=${encodeURIComponent(id)}`,
      { method: "DELETE", credentials: 'include' }
    );
    const result = await res.json();
    if (result.status) {
      this.showMessage("Item deleted successfully!", "success");
      this.loadItems();
    } else {
      this.showMessage(result.message || "Failed to delete item", "error");
    }
  } catch (err) {
    console.error("Error deleting item:", err);
    this.showMessage("Error deleting item", "error");
  }
}




  async searchInventory(query) {
    try {
      const res = await fetch(`${this.API_ITEMS}?action=searchInventory&query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      const response = await res.json();
      if (response.status && Array.isArray(response.data) && response.data.length > 0) {
        this.renderItems(response.data);
      } else {
        this.itemTableBody.innerHTML = `<tr><td colspan="6">No results found</td></tr>`;
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  }



  /*********************
   * Events binding
   *********************/
  bindEvents() {
    this.categorySelect.addEventListener("change", (e) => {
      this.loadSubcategories(e.target.value);
    });

    this.addItemForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("itemName").value.trim();
      const price = parseFloat(document.getElementById("itemPrice").value);
      if (!/^[A-Za-z\s\-]+$/.test(name)) {
        this.showMessage("Item name must only contain letters, spaces, or dashes.", "error");
        return;
      }
      if (isNaN(price) || price < 0) {
        this.showMessage("Price must be a positive number!", "error");
        return;
      }

      const newItem = {
        name,
        price,
        category_id: parseInt(this.categorySelect.value || 0, 10),
        subcategory_id: parseInt(this.subcategorySelect.value || 0, 10),
        description: document.getElementById("itemDescription").value
      };

      this.addItem(newItem);
    });

    // Table-level delegation (update / delete / add stock)
    document.querySelector("#itemTable").addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;
      const id = row.dataset.id;

      if (e.target.classList.contains("btnUpdate")) {
        const updated = {
          id,
          name: row.querySelector(".edit-name").value,
          price: row.querySelector(".edit-price").value,
          description: row.querySelector(".edit-desc").value
        };
        this.updateItem(updated);
        return;
      }

      if (e.target.classList.contains("btnDelete")) {
        if (confirm("Delete this item?")) {
          this.deleteItem(id);
        }
        return;
      }

    });

    // search input
    this.searchInput?.addEventListener('input', () => {
      const query = this.searchInput.value.trim();
      if (query.length < 1) {
        this.loadItems();
        return;
      }
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.searchInventory(query);
      }, 300);
    });


    // back button
    document.getElementById("btnBack").addEventListener("click", () => {
      window.location.href = "../inventory.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const manager = new ItemManager();
  manager.init();
});
