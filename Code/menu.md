folder structure 
├── frontend/
│   ├── js/
│   │   ├── api.js
│   │   ├── cart.js
│   │   ├── main.js
│   │   ├── modal.js
│   │   ├── payment.js
│   │   ├── session.js
│   ├
│   ├── menu/
|   │   ├── images/
│   │   ├── menu.html
│   │   ├── menu.css
│   │   ├── menuMain.js # just for logout

│   ├── cart/
│   │   ├── cart.html
│   │   ├── cart.css
│   │   ├── cartMain.js
│   ├
│   ├── login/
│   │   ├── login.html
│   │   ├── loginMain.js
│   │ 
|   │   ├── css/
|   │   │   ├── login.css
|   │   
|   │   ├── js/
|   │   │   ├── config.js
|   │   │   ├── auth.js
|   │   │   ├── init.js
|   │ 
|   │   ├── components/
|   │   │   
|   │   │   ├── login-form.html
|   │   │   ├── signup-form.html
|   │   │   ├── start-screen.html


menu.html 

<!-- menu.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Menu Page Tester</title>
  <link rel="stylesheet" href="menu.css" />
</head>
<body>
  <header>
    <button onclick="window.location.href='../cart/cart.html'">🛒 View Cart</button>
    <button onclick="window.location.href='../history/history.html'">📜 Order History</button>
    <button onclick="logout()">🚪 Logout</button>
  </header>

  <main>
    <section id="categorySelect">
      <h2>Choose a Category</h2>
      <button onclick="loadCategory('Drink')">🥤 Drinks</button>
      <button onclick="loadCategory('Sandwich')">🥪 Sandwiches</button>
    </section>

    <button id="backButton" onclick="showCategories()" style="display:none">🔙 Back</button>

    <section id="itemList"></section>
  </main>

  <!-- Modal -->
  <div id="itemModal" class="modal" style="display: none;">
    <div class="modal-content">
      <h2 id="modalItemName"></h2>
      <label>Size:
        <select id="modalSize"></select>
      </label>
      <label>Quantity:
        <input type="number" id="modalQuantity" value="1" min="1" />
      </label>
      <div class="modal-actions">
        <button onclick="addToCart()">Add to Cart</button>
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- Payment Modal -->
  <div id="paymentModal" class="modal" style="display: none;">
    <div class="modal-content">
      <h3>🧾 Checkout</h3>
      <p>Total: ₱<span id="paymentTotal">0.00</span></p>
      <p>Discount: ₱<span id="paymentDiscount">0.00</span></p>
      <p>Final: ₱<span id="finalAmount">0.00</span></p>
      <label>Cash:
        <input type="number" id="cashInput" placeholder="Enter cash" />
      </label>
      <label>Payment Type:
        <select id="paymentType">
          <option value="cash">Cash</option>
          <option value="gcash">GCash</option>
        </select>
      </label>
      <div class="modal-actions">
        <button onclick="processPayment()">Pay</button>
        <button onclick="closePaymentModal()">Cancel</button>
      </div>
    </div>
  </div>


  <script type="module" src="./menuMain.js"></script>
</body>
</html>

menu.css 

/* menu.css */
body {
  font-family: sans-serif;
  margin: 20px;
  background-color: #f5f5f5;
}

button {
  margin: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background-color: #00704A;
  color: white;
  border-radius: 4px;
}

button:hover {
  background-color: #005F3C;
}

.item-card {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
}

.item-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.modal {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
}

.modal-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
 
mainMenu.js

// menuMain.js
import '../login/js/auth.js';

window.logout = () => {
  localStorage.clear();
  alert("Logged out.");
  window.location.href = '../login/login.html';
};

js/auth 


// ✅ Load dynamic components
window.showForm = async function (type) {
  const root = document.getElementById("component-root");
  root.innerHTML = ""; // Clear old content

  if (type === "login") {
    await loadComponent("components/login-form.html", "component-root");
  } else if (type === "signup") {
    await loadComponent("components/signup-form.html", "component-root");
  }

  clearError();
};

window.goBack = async function () {
  const root = document.getElementById("component-root");
  root.innerHTML = "";
  await loadComponent("components/start-screen.html", "component-root");
  clearError();
};

// ✅ LOGIN
async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  try {
    const res = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // for session cookies
      body: JSON.stringify({ email, password })

    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      localStorage.removeItem("isGuest");
      alert("Login successful!");
      window.location.href = "../menu/menu.html";
    } else {
      showError(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Server error. Please try again.");
  }
}

// ✅ SIGN UP
async function signup() {
  const userData = {
    first_name: document.getElementById("firstName").value.trim(),
    middle_name: document.getElementById("middleName").value.trim(),
    last_name: document.getElementById("lastName").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    password: document.getElementById("signupPass").value,
    phone: document.getElementById("signupPhone").value.trim(),
    street: document.getElementById("street").value.trim(),
    city: document.getElementById("city").value.trim(),
    province: document.getElementById("province").value.trim(),
    postal_code: document.getElementById("postalCode").value.trim(),
    country: document.getElementById("country").value.trim(),
  };

  try {
    const res = await fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (data.success) {
      showForm("login");
      showMessage("Signup successful! Please log in.", "green");
    } else {
      showError(data.message || "Signup failed.");
    }
  } catch (err) {
    console.error("Signup error:", err);
    showError("Server error during signup.");
  }
}

// 🚪 Guest Access
window.continueWithoutAccount = function () {
  localStorage.setItem("isGuest", "true");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedInUser");

  setTimeout(() => {
    console.log("✅ Guest mode enabled");
    window.location.href = "../menu/menu.html";
  }, 500);
};

// 🧠 Auth Helpers
function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("isGuest");
}

function isLoggedIn() {
  return localStorage.getItem("loggedInUser") !== null;
}

// 🔔 UI Helpers
function showError(msg) {
  const el = document.getElementById("errorMsg");
  if (el) {
    el.textContent = msg;
    el.style.color = "red";
  }
}

function showMessage(msg, color = "green") {
  const el = document.getElementById("errorMsg");
  if (el) {
    el.textContent = msg;
    el.style.color = color;
  }
}

function clearError() {
  const el = document.getElementById("errorMsg");
  if (el) el.textContent = "";
}
