frontend
│   ├── login/
│   │   ├── login.html
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

components/loginform 
<div id="form-login" class="hidden">
  <h2>Login</h2>
  <input type="email" id="loginEmail" placeholder="Email" required />
  <input type="password" id="loginPass" placeholder="Password" required />
  <button onclick="login()">Login</button>
  <button onclick="goBack()">Back</button>
</div>

components/signup form
 <div id="form-signup" class="hidden">
  <h2>Sign Up</h2>
  <input id="firstName" placeholder="First Name" />
  <input id="middleName" placeholder="Middle Name" />
  <input id="lastName" placeholder="Last Name" />
  <input id="signupEmail" placeholder="Email" />
  <input id="signupPass" type="password" placeholder="Password" />
  <input id="signupPhone" placeholder="Phone" />
  <input id="street" placeholder="Street" />
  <input id="city" placeholder="City" />
  <input id="province" placeholder="Province" />
  <input id="postalCode" placeholder="Postal Code" />
  <input id="country" placeholder="Country" />
  <button onclick="signup()">Sign Up</button>
  <button onclick="goBack()">Back</button>
</div>
components/start screen
 <div id="start-screen">
  <h2>Welcome to Starbucks POS</h2>
  <button onclick="showForm('login')">Login</button>
  <button onclick="showForm('signup')">Sign Up</button>
  <button onclick="continueWithoutAccount()">Continue as Guest</button>
</div>

js/auth.js

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
      body: JSON.stringify({ username: email, password })
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


js/init.js
// login/js/init.js
async function loadComponent(path, containerId, clear = false) {
  const res = await fetch(path);
  const html = await res.text();
  const container = document.getElementById(containerId);
  if (clear) container.innerHTML = ""; // remove previous content
  container.insertAdjacentHTML("beforeend", html);
}

async function init() {
  await loadComponent("components/start-screen.html", "component-root");

  // Load config & then auth.js
  const configScript = document.createElement("script");
  configScript.src = "js/config.js";
  configScript.onload = () => {
    const authScript = document.createElement("script");
    authScript.src = "js/auth.js";
    document.body.appendChild(authScript);
  };
  document.body.appendChild(configScript);
}

init();
js/config.js

const BASE_URL = 'http://localhost/SOFTENG2/backend/api/index2.php';
const LOGIN_ENDPOINT = `${BASE_URL}/login`;
const SIGNUP_ENDPOINT = `${BASE_URL}/signup`;

login.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Starbucks POS – Login or Sign Up</title>
  <link rel="stylesheet" href="css/login.css" />
</head>
<body>
  <div class="container">
    <div id="component-root"></div>
    <div id="errorMsg" class="error-msg"></div>
  </div>

  <!-- Load init script -->
  <script src="js/init.js"></script>
</body>
</html>


