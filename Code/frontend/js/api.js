// frontend/js/api.js
import { openModal } from './modal.js';
import { API_BASE_PATH } from './config.js';

const BASE_IMG_PATH = '../../frontend/menu/images/';

const IMAGE_MAP = {
  "Iced Americano":                 BASE_IMG_PATH + "americano.jpg",
  "Caffè Latte":                    BASE_IMG_PATH + "latte.jpg",
  "Matcha Green Tea Latte":         BASE_IMG_PATH + "matcha.jpg",
  "Very Berry Hibiscus Refresher":  BASE_IMG_PATH + "refresher.jpg",
  "Egg Sandwich":                   BASE_IMG_PATH + "egg.jpg",
  "Bacon & Cheese Sandwich":        BASE_IMG_PATH + "bacon.jpg",
  "Cheddar Melt Sandwich":          BASE_IMG_PATH + "cheddar.jpg",
  "Ice Starbucks Purple Cream":     BASE_IMG_PATH + "cream.jpg",
  "Double-Smoked Bacon, Cheddar & Egg Sandwich": BASE_IMG_PATH + "BaconGoudaEggSandwich.jpg",
  "Turkey Bacon, Cheddar & Egg White Sandwich":  BASE_IMG_PATH + "DoubleSmokedBaconEggSandwich.jpg"
};

function getImageForItem(name) {
  return IMAGE_MAP[name] || BASE_IMG_PATH + "ClassicCup.png";
}

export function loadTopSelling(categoryName) {
  const catId = categoryName === 'Drink' ? 1 : 2;

  document.getElementById('categorySelect')?.style.setProperty('display','none');
  document.getElementById('backButton')?.style.setProperty('display','block');

  fetch(`${API_BASE_PATH}/topselling`, {
    credentials: 'include'
  })
    .then(r => r.json())
    .then(result => {
      if (!result.status) throw new Error('No data');
      const byCat = result.data.filter(item => item.category_id == catId);
      displayTopSelling(byCat);
    })
    .catch(err => console.error('Could not load top-selling:', err));
}

function displayTopSelling(items) {
  const ul = document.querySelector('#foodSelection ul');
  if (!ul) return;

  const top4 = items.slice(0, 4);

  ul.innerHTML = top4.map(item => `
    <li class="prodInfo">
      <div class="contents">
        <img
          src="${getImageForItem(item.name)}"
          alt="${item.name}"
          class="item-image"
        />
        <h2>${item.name}</h2>
        <p>₱${parseFloat(item.price).toFixed(2)}</p>
        <p>Total Sold: ${item.total_sold}</p>
        <button onclick="addToCart()">Add to Cart</button>
      </div>
    </li>
  `).join('');
}

export function loadCategory(categoryName) {
  document.getElementById('categorySelect').style.display = 'none';
  document.getElementById('backButton').style.display = 'block';

  fetch(`${API_BASE_PATH}/items`, {
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      const filtered = data.filter(item =>
        (categoryName === 'Drink'   && item.category_id == 1) ||
        (categoryName === 'Sandwich'&& item.category_id == 2)
      );
      displayItems(filtered);
    })
    .catch(err => console.error('Could not load items:', err));
}

function displayItems(items) {
  const itemList = document.getElementById('itemList');
  itemList.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.onclick = () => openModal(item);

    card.innerHTML = `
      <img src="images/${item.image_url || 'default.jpg'}" class="item-img" alt="${item.name}">
      <div class="item-name">${item.name}</div>
      <div class="item-description">${item.description}</div>
      <div class="item-price">₱${parseFloat(item.price).toFixed(2)}</div>
    `;
    itemList.appendChild(card);
  });
}

export function showCategories() {
  document.getElementById('categorySelect').style.display = 'block';
  document.getElementById('itemList').innerHTML = '';
  document.getElementById('backButton').style.display = 'none';
}
