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
        if (localStorage.getItem("isGuest")) return;

        try {
            const res = await fetch(`${this.apiBasePath}/check_login`, { credentials: 'include' });

            if (res.status === 401) {
                window.location.href = '../login/login.html';
                throw new Error("Not logged in");
            }

            const data = await res.json();
            if (!data.status) {
                window.location.href = '../login/login.html';
            }
        } catch (err) {
            console.warn("Login check failed:", err);
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
