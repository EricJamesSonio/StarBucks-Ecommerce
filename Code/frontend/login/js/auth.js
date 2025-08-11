import { LOGIN_ENDPOINT, SIGNUP_ENDPOINT } from "./config.js";

import { loadComponent } from "./utils.js";
// At the bottom of auth.js
window.login = login;
window.signup = signup;

window.showForm = async function (type) {
  const root = document.getElementById("component-root");
  root.innerHTML = ""; // Clear old content

  if (type === "login") {
    await loadComponent("components/login-form.html", "component-root");
  } else if (type === "signup") {
    await loadComponent("components/signup-form.html", "component-root");
    
    // Dynamically load signup.js AFTER HTML injected
    const existingScript = document.getElementById('signup-script');
    if (existingScript) existingScript.remove(); // Remove old if any

    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'signup-script';
    script.src = './js/signup.js'; // Adjust path as needed
    document.body.appendChild(script);
  }

  clearError();
};


window.goBack = async function () {
  const root = document.getElementById("component-root");
  root.innerHTML = "";
  await loadComponent("components/start-screen.html", "component-root");
  clearError();
};

async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value.trim();

  try {
    const res = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ keep session cookies
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      // Save login state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("isGuest");

      // Save user info for later
      const userData = {
        id: data.account_id,
        type: data.account_type
      };
      localStorage.setItem("loggedInUser", JSON.stringify(userData));

      alert("Login successful!");

      // ✅ Redirect based on account type
      if (data.account_type && data.account_type.toLowerCase() === "admin") {
        window.location.href = "../admin/panel/panel.html";
      } else {
        window.location.href = "../menu/menu.html";
      }
    } else {
      showError(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError("Server error. Please try again.");
  }
}


async function signup(userData) {
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

export { login, signup };
