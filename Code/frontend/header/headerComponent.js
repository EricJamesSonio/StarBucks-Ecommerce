// headerComponent.js - Main HeaderComponent class
import { headerHTML } from './headerTemplate.js';
import { headerCSS } from './headerStyles.js';
import { logout } from "../../frontend/login/js/auth.js";  // adjust the path if needed

import {  
  loadUserProfile, 
  ensureCSSVariables, 
  loadCountries,   // 🔹 add
  loadProvinces,   // 🔹 add
  loadCities       // 🔹 add
} from './headerUtils.js';

class HeaderComponent {
    constructor() {
        this.headerHTML = headerHTML;
        this.headerCSS = headerCSS;
    }

    render() {
        // Create header container
        const headerContainer = document.createElement('header');
        headerContainer.innerHTML = this.headerCSS + this.headerHTML;

        // Add to the beginning of the body
        document.body.insertBefore(headerContainer, document.body.firstChild);

        // Add CSS to prevent space at top
        const bodyStyle = document.createElement('style');
        bodyStyle.textContent = `
            body {
                margin: 0 !important;
                padding: 0 !important;
            }

            html, body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
            }

            body {
                padding-top: 0 !important;
            }

            section:first-of-type {
                padding-top: 0 !important;
            }
        `;
        document.head.appendChild(bodyStyle);

        // Make sure CSS variables are defined
        ensureCSSVariables();

        // Load and display user profile image if available
        this.loadProfileImage();

        // Setup profile modal functionality
        this.setupProfileModal();

        // Update section padding when window resizes
        this.updateSectionPadding();
        window.addEventListener('resize', this.updateSectionPadding.bind(this));

        // Initialize profile modal functionality
        this.initProfileModal();
    }

    updateSectionPadding() {
        const header = document.querySelector('#head-nav');
        const firstSection = document.querySelector('section:first-of-type');

        if (header && firstSection) {
            const headerHeight = header.offsetHeight;
            firstSection.style.paddingTop = headerHeight + 'px';
        }
    }

    async loadProfileImage() {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (!isLoggedIn) return;


            // Then try to fetch from API for the latest image
            const response = await fetch(`${API_BASE_PATH}/profile`, {
                method: "GET",
                credentials: "include"
            });
    }

setupProfileModal() {
  // Wait for DOM to be fully loaded
  setTimeout(() => {
    const profileIcon = document.getElementById('profile-icon');
    const profileModal = document.getElementById('profile-modal');
    const closeProfile = document.getElementById('close-profile');

    if (profileIcon && profileModal && closeProfile) {
      profileIcon.addEventListener('click', () => {
        profileModal.style.display = "block";
        if (typeof loadUserProfile === 'function') {
          loadUserProfile();
        }
      });

      closeProfile.addEventListener('click', () => {
        profileModal.style.display = "none";
      });

      window.addEventListener('click', (event) => {
        if (event.target === profileModal) {
          profileModal.style.display = "none";
        }
      });
    }

    // ✅ Attach dropdown events here
    const countrySelect = document.getElementById("country");
    const provinceSelect = document.getElementById("province");
    const citySelect = document.getElementById("city");

    if (countrySelect) {
      // Load countries immediately when modal initializes
      loadCountries();

      countrySelect.addEventListener("change", (e) => {
        const countryId = e.target.value;
        if (countryId) {
          loadProvinces(countryId);
          if (citySelect) {
            citySelect.innerHTML = `<option value="">-- Select City --</option>`;
          }
        }
      });
    }

    if (provinceSelect) {
      provinceSelect.addEventListener("change", (e) => {
        const provinceId = e.target.value;
        if (provinceId) loadCities(provinceId);
      });
    }

  }, 100);
}


    initProfileModal() {
        const userData = localStorage.getItem("loggedInUser");
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";


        if (isLoggedIn && userData) {
            const user = JSON.parse(userData);

            // Check if user.type is admin
            if (user.type && user.type.toLowerCase() === "admin") {
                const adminLink = document.getElementById("admin-link");
                if (adminLink) {
                    adminLink.style.display = "inline-block";
                }
            }

            // Update sign up button to logout
// Update sign up button to logout
const signUpButton = document.querySelector('#icon-list button');
if (signUpButton) {
    signUpButton.textContent = "LOGOUT";
    signUpButton.onclick = () => {
        logout(); // ✅ use the auth logout
    };
}

        }


        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                        const payload = {
        first_name: document.getElementById("first_name").value,
        middle_name: document.getElementById("middle_name").value,
        last_name: document.getElementById("last_name").value,
        street: document.getElementById("street").value,
        country: parseInt(document.getElementById("country").value) || null,
        province: parseInt(document.getElementById("province").value) || null,
        city: parseInt(document.getElementById("city").value) || null,
        image_url: document.getElementById("profile-image").src
        };

        try {
        const response = await fetch(`${API_BASE_PATH}/profile`, {   // ✅ match main.js
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.status) {
            alert(data.message || "Profile updated successfully!");
            document.getElementById("profile-modal").style.display = "none";
        } else {
            alert(data.message || "Failed to update profile.");
        }
        } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile");
        }

            });
        }

    }
  
}




export { HeaderComponent };
