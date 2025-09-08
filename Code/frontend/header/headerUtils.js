// headerUtils.js - Utility functions and helpers for the header component

// Custom event to trigger profile image updates
export function updateProfileImageInHeader(imageUrl) {
    const event = new CustomEvent('profileImageUpdated', {
        detail: { imageUrl: imageUrl }
    });
    document.dispatchEvent(event);
}

// Load user profile function
export async function loadUserProfile() {
    try {
        const res = await fetch(`${API_BASE_PATH}/profile`, {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) {
            if (res.status === 401) {
                console.log("Please log in to view profile");
                // Optionally show login prompt or redirect
                return;
            }
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (!data.status) return;

        const user = data.user;
        document.getElementById("first_name").value = user.first_name || "";
        document.getElementById("middle_name").value = user.middle_name || "";
        document.getElementById("last_name").value = user.last_name || "";
        document.getElementById("street").value = user.address?.street || "";

        if (user.image_url) {
            document.getElementById("profile-image").src = user.image_url;
            document.getElementById("profile-image-url").value = user.image_url;

            // Also update the header if the function exists
            if (typeof updateProfileImageInHeader === 'function') {
                updateProfileImageInHeader(user.image_url);
            }
        }

        // Load countries, provinces, cities if needed
        // await loadCountries();
        // ... etc

    } catch (err) {
        console.error("Failed to load user profile:", err);
        alert("Failed to load profile. Please try again.");
    }
}

// Ensure CSS variables are defined
export function ensureCSSVariables() {
    if (!document.documentElement.style.getPropertyValue('--main-color-darkgreen')) {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --main-color-green: #00704a;
                --main-color-darkgreen: #00482b;
                --main-color-lightgreen: #009959;
            }
        `;
        document.head.appendChild(style);
    }
}

// Function to upload image to server
export async function uploadProfileImage(file) {
    try {
        const formData = new FormData();
        formData.append('profile_image', file);

        const response = await fetch(`${API_BASE_PATH}/profile/upload-image`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            if (result.status && result.image_url) {
                // Update the image URL field with server response
                const profileImageUrl = document.getElementById('profile-image-url');
                if (profileImageUrl) {
                    profileImageUrl.value = result.image_url;
                }

                // Update the header with the final server URL
                if (typeof updateProfileImageInHeader === 'function') {
                    updateProfileImageInHeader(result.image_url);
                }

                alert('Profile image uploaded successfully!');
            }
        } else {
            alert('Failed to upload image. Please try again.');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
    }
}
