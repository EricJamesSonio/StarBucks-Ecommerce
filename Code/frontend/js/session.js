
// session.js
let sizes = [];

export function loadSizes() {
  fetch('http://localhost/SOFTENG2/backend/api/index2.php/sizes', {
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

  fetch('http://localhost/SOFTENG2/backend/api/index2.php/check_login', {
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
