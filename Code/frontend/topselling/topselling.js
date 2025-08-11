import { API_BASE_PATH, IMAGES_BASE_PATH } from '../js/config.js';

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("top-items-container");

  function getImageForItem(itemName) {
    const images = {
      "Iced Americano": IMAGES_BASE_PATH + "americano.jpg",
      "Caffè Latte": IMAGES_BASE_PATH + "latte.jpg",
      "Matcha Green Tea Latte": IMAGES_BASE_PATH + "matcha.jpg",
      "Very Berry Hibiscus Refresher": IMAGES_BASE_PATH + "refresher.jpg",
      "Egg Sandwich": IMAGES_BASE_PATH + "egg.jpg",
      "Bacon & Cheese Sandwich": IMAGES_BASE_PATH + "bacon.jpg",
      "Cheddar Melt Sandwich": IMAGES_BASE_PATH + "cheddar.jpg",
      "Ice Starbucks Purple Cream": IMAGES_BASE_PATH + "cream.jpg"
    };
    return images[itemName] || IMAGES_BASE_PATH + "ClassicCup.png"; // fallback image
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
