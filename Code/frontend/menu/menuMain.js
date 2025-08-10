// menuMain.js
import '../login/js/auth.js';
import { API_BASE_PATH } from '../js/config.js';

window.logout = () => {
  localStorage.clear();
  fetch(`${API_BASE_PATH}/logout`, { 
    credentials: 'include'
  }).then(() => window.location.href = '../../design/home/index.html');
};
