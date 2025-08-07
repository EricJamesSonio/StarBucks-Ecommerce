// top-items.js or relevant script file
import { API_BASE_PATH } from '../config.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("top-items-container");

  function getImageForItem(itemName) {
    const images = {
      "Iced Americano": "../menu/images/americano.jpg",
      "Caffè Latte": "../menu/images/latte.jpg",
      "Matcha Green Tea Latte": "../menu/images/matcha.jpg",
      "Very Berry Hibiscus Refresher": "../menu/images/refresher.jpg",
      "Egg Sandwich": "../menu/images/egg.jpg",
      "Bacon & Cheese Sandwich": "../menu/images/bacon.jpg",
      "Cheddar Melt Sandwich": "../menu/images/cheddar.jpg",
      "Ice Starbucks Purple Cream": "../menu/images/cream.jpg"
    };
    return images[itemName] || "../menu/images/ClassicCup.png"; // fallback image
  }

  try {
    const response = await fetch(`${API_BASE_PATH}/topselling`, {
      credentials: 'include'
    });
    const result = await response.json();

    if (!result.status || result.data.length === 0) {
      container.innerHTML = "<p>No top-selling data available.</p>";
      return;
    }

    container.innerHTML = "";

    result.data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("item-box");

      const imageUrl = getImageForItem(item.name);

      div.innerHTML = `
        <img src="${imageUrl}" alt="${item.name}" class="item-image" />
        <h3>${item.name}</h3>
        <p><strong>Price:</strong> ₱${parseFloat(item.price).toFixed(2)}</p>
        <p><strong>Total Sold:</strong> ${item.total_sold}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("Error fetching top-selling items:", err);
    container.innerHTML = "<p>Failed to load data.</p>";
  }
});
