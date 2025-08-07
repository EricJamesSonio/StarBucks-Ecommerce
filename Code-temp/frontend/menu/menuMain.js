// menuMain.js
import '../login/js/auth.js';

window.logout = () => {
  localStorage.clear();
  fetch('../../backend/api/index2.php/logout', { 
    credentials: 'include'
  }).then(() => window.location.href = '../../design/home/index.html');
};
