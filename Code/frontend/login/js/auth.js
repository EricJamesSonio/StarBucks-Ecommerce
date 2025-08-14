// auth.js
import { LOGIN_ENDPOINT, SIGNUP_ENDPOINT } from "./config.js";
import { loadComponent } from "./utils.js";

class AuthManager {
    constructor(loginEndpoint, signupEndpoint) {
        this.loginEndpoint = loginEndpoint;
        this.signupEndpoint = signupEndpoint;
    }

    async showForm(type) {
        const root = document.getElementById("component-root");
        root.innerHTML = "";

        if (type === "login") {
            await loadComponent("components/login-form.html", "component-root");
        } else if (type === "signup") {
            await loadComponent("components/signup-form.html", "component-root");

            // Ensure fresh script load
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
        const root = document.getElementById("component-root");
        root.innerHTML = "";
        await loadComponent("components/start-screen.html", "component-root");
        this.clearError();
    }

    async login() {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPass").value.trim();

        try {
            const res = await fetch(this.loginEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                this.#saveLoginState(data);
                alert("Login successful!");
                this.#redirectUser(data.account_type);
            } else {
                this.showError(data.message || "Login failed.");
            }
        } catch (error) {
            console.error("Login error:", error);
            this.showError("Server error. Please try again.");
        }
    }

    async signup(userData) {
        try {
            const res = await fetch(this.signupEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await res.json();

            if (data.success) {
                this.showForm("login");
                this.showMessage("Signup successful! Please log in.", "green");
            } else {
                this.showError(data.message || "Signup failed.");
            }
        } catch (err) {
            console.error("Signup error:", err);
            this.showError("Server error during signup.");
        }
    }

    continueWithoutAccount() {
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

    showError(msg) {
        const el = document.getElementById("errorMsg");
        if (el) {
            el.textContent = msg;
            el.style.color = "red";
        }
    }

    showMessage(msg, color = "green") {
        const el = document.getElementById("errorMsg");
        if (el) {
            el.textContent = msg;
            el.style.color = color;
        }
    }

    clearError() {
        const el = document.getElementById("errorMsg");
        if (el) el.textContent = "";
    }

    // Private helpers
    #saveLoginState(data) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.removeItem("isGuest");
        const userData = {
            id: data.account_id,
            type: data.account_type
        };
        localStorage.setItem("loggedInUser", JSON.stringify(userData));
    }

    #redirectUser(accountType) {
        if (accountType && accountType.toLowerCase() === "admin") {
            window.location.href = "../admin/panel/panel.html";
        } else {
            window.location.href = "../menu/menu.html";
        }
    }
}

// Create singleton instance
export const authManager = new AuthManager(LOGIN_ENDPOINT, SIGNUP_ENDPOINT);

// Keep backward compatibility with global functions
window.showForm = (type) => authManager.showForm(type);
window.goBack = () => authManager.goBack();
window.login = () => authManager.login();
window.signup = (data) => authManager.signup(data);
window.continueWithoutAccount = () => authManager.continueWithoutAccount();

export { authManager };
