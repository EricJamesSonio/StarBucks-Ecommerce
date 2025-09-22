// headerComponent.js - Main HeaderComponent class
import { headerHTML } from './headerTemplate.js';
import { headerCSS } from './headerStyles.js';
import { 
  updateProfileImageInHeader, 
  loadUserProfile, 
  ensureCSSVariables, 
  uploadProfileImage,
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
        try {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (!isLoggedIn) return;

            // Try to get profile image from localStorage first (for performance)
            const savedProfileImage = localStorage.getItem("profileImage");
            if (savedProfileImage) {
                this.updateProfileIcon(savedProfileImage);
            }

            // Then try to fetch from API for the latest image
            const response = await fetch(`${API_BASE_PATH}/profile`, {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status && data.user && data.user.image_url) {
                    this.updateProfileIcon(data.user.image_url);
                    // Save to localStorage for future use
                    localStorage.setItem("profileImage", data.user.image_url);
                }
            }
        } catch (error) {
            console.error("Failed to load profile image:", error);
        }
    }

    updateProfileIcon(imageUrl) {
        const profileIcon = document.getElementById('profile-icon');
        if (profileIcon && imageUrl) {
            profileIcon.src = imageUrl;
            // Add a border to make it look nice
            profileIcon.style.border = '2px solid white';
        }
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

    // Listen for profile image updates
    this.setupProfileImageUpdateListener();
  }, 100);
}


    setupProfileImageUpdateListener() {
        // Create a custom event listener for profile image updates
        document.addEventListener('profileImageUpdated', (event) => {
            if (event.detail && event.detail.imageUrl) {
                this.updateProfileIcon(event.detail.imageUrl);
                // Save to localStorage
                localStorage.setItem("profileImage", event.detail.imageUrl);
            }
        });
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
            const signUpButton = document.querySelector('#icon-list button');
            if (signUpButton) {
                signUpButton.textContent = "LOGOUT";
                signUpButton.onclick = () => {
                    localStorage.removeItem("loggedInUser");
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("profileImage");
                    window.location.reload();
                };
            }
        }

        // File input for image selection (hidden)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        // Open file dialog when "Choose from Gallery" is clicked
        const openImagePickerBtn = document.getElementById('open-image-picker');
        if (openImagePickerBtn) {
            openImagePickerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                fileInput.click();
            });
        }

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check if file is an image
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }

                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size must be less than 5MB');
                    return;
                }

                // Create a preview of the selected image
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageDataUrl = e.target.result;

                    // Update profile image preview
                    const profileImage = document.getElementById('profile-image');
                    if (profileImage) {
                        profileImage.src = imageDataUrl;
                    }

                    // Update the image URL field
                    const profileImageUrl = document.getElementById('profile-image-url');
                    if (profileImageUrl) {
                        profileImageUrl.value = imageDataUrl;
                    }

                    // Update the header profile icon immediately
                    if (typeof updateProfileImageInHeader === 'function') {
                        updateProfileImageInHeader(imageDataUrl);
                    }

                    // Upload to server
                    uploadProfileImage(file);
                };
                reader.readAsDataURL(file);
            }
        });

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

        // Initialize drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const profileImage = document.getElementById('profile-image');
        const dropZone = document.getElementById('open-image-picker');
        const fileInput = document.querySelector('input[type="file"]');

        if (profileImage && dropZone && fileInput) {
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
                document.body.addEventListener(eventName, preventDefaults, false);
            });

            // Highlight drop zone when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });

            // Handle dropped files
            dropZone.addEventListener('drop', handleDrop, false);

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            function highlight() {
                dropZone.style.backgroundColor = '#004f1a';
            }

            function unhighlight() {
                dropZone.style.backgroundColor = '#006241';
            }

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            }
        }
    }

    
}




export { HeaderComponent };
