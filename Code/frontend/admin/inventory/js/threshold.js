// Use API_BASE_PATH from config.js if available, else fallback
const basePath = (typeof window !== 'undefined' && window.API_BASE_PATH)
  ? window.API_BASE_PATH.replace(/\/+$/, '') // remove trailing slash
  : `${window.location.origin}/starbucks-ecommerce/code/api`;

const API = `${basePath}/inventory`;

async function getSetting(){
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('getSetting error', err);
    return { status: false, error: err.message };
  }
}

async function setThreshold(threshold, updated_by){
  const t = parseInt(threshold, 10);
  if (Number.isNaN(t) || t < 0) {
    return { status: false, error: 'Invalid threshold' };
  }
  try {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        global_threshold: t,
        updated_by: updated_by ? parseInt(updated_by, 10) : null
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return res.json();
  } catch (err) {
    console.error('setThreshold error', err);
    return { status: false, error: err.message };
  }
}

async function getLowStock(){
  try {
    const res = await fetch(`${API}?action=low-stock`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch (err) {
    console.error('getLowStock error', err);
    return { status: false, error: err.message, data: [] };
  }
}

// Button event
const btnSet = document.getElementById('btnSet');
if (btnSet) {
  btnSet.addEventListener('click', async () => {
    const t = document.getElementById('threshold')?.value;

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
const u = loggedInUser.id || null;

    btnSet.disabled = true;
    btnSet.textContent = 'Saving...';
    const j = await setThreshold(t, u);
    btnSet.disabled = false;
    btnSet.textContent = 'Set Threshold';
    if (j.status) {
      alert('Threshold set');
      await renderLowStock();
    } else {
      alert('Error: ' + (j.error || JSON.stringify(j)));
    }
  });
}

async function renderLowStock(){
  const ul = document.getElementById('lowStockList');
  if (!ul) return;
  ul.innerHTML = '<li>Loading...</li>';
  const j = await getLowStock();
  ul.innerHTML = '';
  if (!j || !j.data || j.data.length === 0) {
    ul.innerHTML = '<li>No low-stock items (or threshold = 0)</li>';
    return;
  }
  j.data.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.name} — qty: ${it.quantity} — price: ${it.price}`;
    ul.appendChild(li);
  });
}

(async function init(){
  const s = await getSetting();
  if (s && s.status) {
    const inp = document.getElementById('threshold');
    if (inp) inp.value = s.data.global_threshold ?? 0;
  } else {
    console.warn('Could not fetch setting', s.error);
  }
  await renderLowStock();
})();
