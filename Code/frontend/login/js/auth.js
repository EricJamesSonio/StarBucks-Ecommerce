import { LOGIN_ENDPOINT, SIGNUP_ENDPOINT } from "./config.js";
import { loadComponent } from "./utils.js";

class AuthController {
  constructor() {
    this.errorEl = document.getElementById("errorMsg");
    this.rootEl = document.getElementById("component-root");
  }

  // 🔔 UI Helpers
  showError(msg) {
    if (this.errorEl) {
      this.errorEl.textContent = msg;
      this.errorEl.style.color = "red";
    }
  }

  showMessage(msg, color = "green") {
    if (this.errorEl) {
      this.errorEl.textContent = msg;
      this.errorEl.style.color = color;
    }
  }

  clearError() {
    if (this.errorEl) this.errorEl.textContent = "";
  }

  // 🏗 Load Forms
  async showForm(type) {
    if (!this.rootEl) return;

    this.rootEl.innerHTML = "";

    if (type === "login") {
      await loadComponent("components/login-form.html", "component-root");
    } else if (type === "signup") {
      await loadComponent("components/signup-form.html", "component-root");

      const existingScript = document.getElementById('signup-script');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.type = 'module';
      script.id = 'signup-script';
      script.src = './js/signup.js';
      document.body.appendChild(script);
    }

    this.clearError();
  }

  async goBack() {
    if (!this.rootEl) return;
    this.rootEl.innerHTML = "";
    await loadComponent("components/start-screen.html", "component-root");
    this.clearError();
  }

  // 🔐 Authentication
  async login() {
    const email = document.getElementById("loginEmail")?.value.trim() || "";
    const password = document.getElementById("loginPass")?.value.trim() || "";

    if (!email || !password) {
      this.showError("Email and password are required.");
      return;
    }

    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.removeItem("isGuest");
        localStorage.setItem("loggedInUser", JSON.stringify({
          id: data.account_id,
          type: data.account_type
        }));

        alert("Login successful!");

        if (data.account_type?.toLowerCase() === "admin") {
          window.location.href = "../admin/panel/panel.html";
        } else {
          window.location.href = "../menu/menu.html";
        }
      } else {
        this.showError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      this.showError("Server error. Please try again.");
    }
  }

  async signup(userData) {
    if (!userData) {
      this.showError("Invalid signup data.");
      return;
    }

    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (data.success) {
        await this.showForm("login");
        this.showMessage("Signup successful! Please log in.");
      } else {
        this.showError(data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      this.showError("Server error during signup.");
    }
  }

  continueAsGuest() {
    localStorage.setItem("isGuest", "true");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");

    setTimeout(() => {
      console.log("✅ Guest mode enabled");
      window.location.href = "../menu/menu.html";
    }, 500);
  }

  logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isGuest");
  }

  isLoggedIn() {
    return localStorage.getItem("loggedInUser") !== null;
  }
}

// Instantiate controller
const authController = new AuthController();

// ✅ Export functions for frontend buttons and other modules
export const login = () => authController.login();
export const signup = (userData) => authController.signup(userData);
export const showForm = (type) => authController.showForm(type);
export const goBack = () => authController.goBack();
export const continueWithoutAccount = () => authController.continueAsGuest();
export const logout = () => authController.logout();

// Optional: attach to window for legacy button handlers
window.login = login;
window.signup = signup;
window.showForm = showForm;
window.goBack = goBack;
window.continueWithoutAccount = continueWithoutAccount;
window.logout = logout;
