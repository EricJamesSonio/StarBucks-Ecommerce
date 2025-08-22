// session.js
import { API_BASE_PATH } from './config.js';

class SessionManager {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
        this.sizes = [];
    }

    async loadSizes() {
        try {
            const res = await fetch(`${this.apiBasePath}/sizes`, { credentials: 'include' });
            this.sizes = await res.json();
            console.log('Loaded sizes:', this.sizes);
        } catch (err) {
            console.error('Could not load sizes:', err);
        }
    }

    async checkLoginOnLoad() {
  if (!localStorage.getItem("isLoggedIn") && !localStorage.getItem("isGuest")) {
      const token = this.ensureGuestToken();

      try {
          const res = await fetch(`${this.apiBasePath}/init_guest`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ guest_token: token }),
              credentials: 'include'
          });

          if (!res.ok) {
              console.error("Failed to init guest:", await res.text());
              throw new Error("Could not register guest session");
          }

          console.log("✅ Guest initialized with token", token);
          localStorage.setItem("isGuest", "true");

          // Now redirect after backend confirms
          window.location.href = '../menu/menu.html';
      } catch (err) {
          console.error("Error initializing guest automatically:", err);
      }
  }
}




    getSizes() {
        return this.sizes;
    }

    ensureGuestToken() {
        let token = localStorage.getItem("guestToken");
        if (!token) {
            token = crypto.randomUUID(); // Or your own generator
            localStorage.setItem("guestToken", token);
        }
        return token;
    }
}

// Singleton instance
export const sessionManager = new SessionManager(API_BASE_PATH);

// Backwards compatibility
export const loadSizes = () => sessionManager.loadSizes();
export const checkLoginOnLoad = () => sessionManager.checkLoginOnLoad();
export const getSizes = () => sessionManager.getSizes();
export const ensureGuestToken = () => sessionManager.ensureGuestToken();
