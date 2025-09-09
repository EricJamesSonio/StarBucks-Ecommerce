// headerUtils.js - Utility functions and helpers for the header component

// Custom event to trigger profile image updates
export function updateProfileImageInHeader(imageUrl) {
    const event = new CustomEvent('profileImageUpdated', {
        detail: { imageUrl: imageUrl }
    });
    document.dispatchEvent(event);
}

export async function loadUserProfile() {
  try {
    const res = await fetch(`${API_BASE_PATH}/profile`, {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.status) return;

    const user = data.user;

    // Fill text fields
    document.getElementById("first_name").value = user.first_name || "";
    document.getElementById("middle_name").value = user.middle_name || "";
    document.getElementById("last_name").value = user.last_name || "";
    document.getElementById("street").value = user.address?.street || "";

    // Image
    if (user.image_url) {
      document.getElementById("profile-image").src = user.image_url;
      document.getElementById("profile-icon").src = user.image_url;
      document.getElementById("profile-image-url").value = user.image_url;
    }

    // 🔹 Load dropdowns
    await loadCountries();
    if (user.address?.country) {
      document.getElementById("country").value = user.address.country;
      await loadProvinces(user.address.country);

      if (user.address?.province) {
        document.getElementById("province").value = user.address.province;
        await loadCities(user.address.province);

        if (user.address?.city) {
          document.getElementById("city").value = user.address.city;
        }
      }
    }
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }
}

export async function loadCountries() {
  const res = await fetch(`${API_BASE_PATH}/getCountries`);
  const countries = await res.json();
  const select = document.getElementById("country");
  if (!select) return;
  select.innerHTML = `<option value="">-- Select Country --</option>`;
  countries.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

export async function loadProvinces(countryId) {
  const res = await fetch(`${API_BASE_PATH}/getProvince?country_id=${countryId}`);
  const provinces = await res.json();
  const select = document.getElementById("province");
  if (!select) return;
  select.innerHTML = `<option value="">-- Select Province --</option>`;
  provinces.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });
}

export async function loadCities(provinceId) {
  const res = await fetch(`${API_BASE_PATH}/getCities?province_id=${provinceId}`);
  const cities = await res.json();
  const select = document.getElementById("city");
  if (!select) return;
  select.innerHTML = `<option value="">-- Select City --</option>`;
  cities.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
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
