import { API_BASE_PATH } from './config.js';
// session.js
let sizes = [];

export function loadSizes() {
  fetch(`${API_BASE_PATH}/sizes`, {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      sizes = data;
      console.log('Loaded sizes:', sizes);
    })
    .catch(err => console.error('Could not load sizes:', err));
}

export function checkLoginOnLoad() {
  if (localStorage.getItem("isGuest")) return;

  fetch(`${API_BASE_PATH}/check_login`, {
    credentials: 'include'
  })
    .then(res => {
      if (res.status === 401) {
        window.location.href = '../login/login.html';
        throw new Error("Not logged in");
      }
      return res.json();
    })
    .then(data => {
      if (!data.status) {
        window.location.href = '../login/login.html';
      }
    })
    .catch(err => console.warn("Login check failed:", err));
}

export function getSizes() {
  return sizes;
}

export function ensureGuestToken() {
  let token = localStorage.getItem("guestToken");
  if (!token) {
    token = crypto.randomUUID(); // Or use your own generator
    localStorage.setItem("guestToken", token);
  }
  return token;
}
