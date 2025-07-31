// menuMain.js
import '../login/js/auth.js';

window.logout = () => {
  localStorage.clear();
  alert("Logged out.");
  window.location.href = '../../design/home/index.html';
};
