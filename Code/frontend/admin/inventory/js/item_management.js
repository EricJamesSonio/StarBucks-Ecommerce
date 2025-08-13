const basePath = (typeof window !== 'undefined' && window.API_BASE_PATH)
  ? window.API_BASE_PATH.replace(/\/+$/, '') // remove trailing slash
  : `${window.location.origin}/starbucks-ecommerce/code/api`;

const API_ITEMS = `${basePath}/items`;

/** Load categories into dropdown */
async function loadCategories() {
  try {
    const res = await fetch(`${basePath}/categories`, { credentials: 'include' });
    const result = await res.json();

    if (!result.status || !Array.isArray(result.data)) {
      throw new Error("Invalid categories data");
    }

    const select = document.getElementById("categorySelect");
    select.innerHTML = result.data
      .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
      .join("");
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

/** When category changes → load subcategories */
document.getElementById("categorySelect").addEventListener("change", async function () {
  try {
    const catId = this.value;
    const res = await fetch(`${API_ITEMS}?action=getSubcategories&category_id=${catId}`);
    const subs = await res.json();

    const subList = Array.isArray(subs.data) ? subs.data : subs; // handle both formats
    document.getElementById("subcategorySelect").innerHTML = subList
      .map(sc => `<option value="${sc.id}">${sc.name}</option>`)
      .join("");
  } catch (err) {
    console.error("Error loading subcategories:", err);
  }
});

/** Load all items into the table */
async function loadItems() {
  try {
    const res = await fetch(`${API_ITEMS}?action=getAll`);
    const result = await res.json();

    if (!result.status || !Array.isArray(result.data)) {
      throw new Error("Invalid items data");
    }

    const tbody = document.querySelector("#itemTable tbody");
    tbody.innerHTML = result.data.map(item => `
      <tr data-id="${item.id}">
        <td><input value="${item.name}" class="edit-name"></td>
        <td><input type="number" value="${item.price}" step="0.01" class="edit-price"></td>
        <td><input type="number" value="${item.quantity}" class="edit-qty"></td>
        <td>${item.category_name}</td>
        <td>${item.subcategory_name}</td>
        <td><textarea class="edit-desc">${item.description || ""}</textarea></td>
        <td>
          <button class="btnUpdate">Update</button>
          <button class="btnDelete">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error loading items:", err);
  }
}

/** Add new item */
document.getElementById("addItemForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const newItem = {
    name: document.getElementById("itemName").value,
    price: document.getElementById("itemPrice").value,
    quantity: document.getElementById("itemQuantity").value,
    category_id: document.getElementById("categorySelect").value,
    subcategory_id: document.getElementById("subcategorySelect").value,
    description: document.getElementById("itemDescription").value
  };

  try {
    const res = await fetch(`${API_ITEMS}?action=add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    });

    const result = await res.json();

    if (result.status) {
      showMessage("Item added successfully!", "success");

      // Clear the form
      document.getElementById("addItemForm").reset();

      // Reload table
      loadItems();
    } else {
      showMessage(result.message || "Failed to add item", "error");
    }
  } catch (err) {
    console.error("Error adding item:", err);
    showMessage("Error adding item", "error");
  }
});


/** Handle update & delete buttons */
document.querySelector("#itemTable").addEventListener("click", async function (e) {
  const row = e.target.closest("tr");
  if (!row) return;
  const id = row.dataset.id;

if (e.target.classList.contains("btnUpdate")) {
  const updated = {
    id,
    name: row.querySelector(".edit-name").value,
    price: row.querySelector(".edit-price").value,
    quantity: row.querySelector(".edit-qty").value,
    description: row.querySelector(".edit-desc").value
  };
  try {
    const res = await fetch(`${API_ITEMS}?action=update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    const result = await res.json();

    if (result.status) {
      showMessage("Item updated successfully!", "success");
      loadItems();
    } else {
      showMessage(result.message || "Failed to update item", "error");
    }
  } catch (err) {
    console.error("Error updating item:", err);
    showMessage("Error updating item", "error");
  }
}


  if (e.target.classList.contains("btnDelete")) {
    if (confirm("Delete this item?")) {
      try {
        await fetch(`${API_ITEMS}?action=delete&id=${id}`, { method: "DELETE" });
        loadItems();
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  }
});

/** Back button */
document.getElementById("btnBack").addEventListener("click", () => {
  window.location.href = "../inventory.html";
});

/** Simple function to show temporary messages */
function showMessage(text, type = "success") {
  let msg = document.createElement("div");
  msg.className = `alert ${type}`; // type can be "success" or "error"
  msg.textContent = text;
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.remove();
  }, 3000);
}

/** Add some basic CSS for alerts */
const style = document.createElement("style");
style.textContent = `
  .alert {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 16px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    opacity: 0.9;
  }
  .alert.success { background-color: #4CAF50; }
  .alert.error { background-color: #f44336; }
`;
document.head.appendChild(style);

const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');
let searchTimeout = null;

searchInput?.addEventListener('input', function () {
  const query = this.value.trim();

  if (query.length < 1) {
    // if empty search → reload all items
    loadItems();
    return;
  }

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetch(`${basePath}/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(response => {
        const tbody = document.querySelector("#itemTable tbody");

        if (response.status && Array.isArray(response.data) && response.data.length > 0) {
          tbody.innerHTML = response.data.map(item => `
            <tr data-id="${item.id}">
              <td><input value="${item.name}" class="edit-name"></td>
              <td><input type="number" value="${item.price}" step="0.01" class="edit-price"></td>
              <td><input type="number" value="${item.quantity}" class="edit-qty"></td>
              <td>${item.category_name || ''}</td>
              <td>${item.subcategory_name || ''}</td>
              <td><textarea class="edit-desc">${item.description || ""}</textarea></td>
              <td>
                <button class="btnUpdate">Update</button>
                <button class="btnDelete">Delete</button>
              </td>
            </tr>
          `).join("");
        } else {
          tbody.innerHTML = `<tr><td colspan="7">No results found</td></tr>`;
        }
      })
      .catch(err => {
        console.error('Search error:', err);
      });
  }, 300);
});


document.addEventListener('click', (event) => {
  if (!event.target.closest('.search-container')) {
    suggestionsBox.style.display = 'none';
  }
});


/** Init page */
loadCategories().then(loadItems);
