import { API_BASE_PATH, IMAGES_BASE_PATH } from '../js/config.js';

class TopSellingManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  getImageForItem(imageUrl) {
    // Use database image_url, fallback to default
    return imageUrl ? IMAGES_BASE_PATH + imageUrl : IMAGES_BASE_PATH + "ClassicCup.png";
  }

  async fetchTopSelling() {
    try {
      const res = await fetch(`${API_BASE_PATH}/topselling`, { credentials: 'include' });
      const result = await res.json();

      if (!result.status || !Array.isArray(result.data) || result.data.length === 0) {
        this.showMessage("No top-selling data available.");
        return;
      }

      this.renderItems(result.data);
    } catch (err) {
      console.error("Error fetching top-selling items:", err);
      this.showMessage("Failed to load data.");
    }
  }

  renderItems(items) {
    this.container.innerHTML = "";

    items.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("item-box");

      div.innerHTML = `
        <img src="${this.getImageForItem(item.image_url)}" alt="${item.name}" class="item-image" />
        <h3>${item.name}</h3>
        <p><strong>Price:</strong> ₱${parseFloat(item.price).toFixed(2)}</p>
        <p><strong>Total Sold:</strong> ${item.total_sold}</p>
      `;

      this.container.appendChild(div);
    });
  }

  showMessage(msg) {
    this.container.innerHTML = `<p>${msg}</p>`;
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const topSelling = new TopSellingManager("top-items-container");
  topSelling.fetchTopSelling();
});
