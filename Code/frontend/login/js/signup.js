import { API_BASE_PATH } from "./config.js";

let selectedCountry = null;
let selectedProvince = null;
let selectedCity = null;

console.log("signup.js loaded, running init code");

const countryContainer = document.getElementById("country-buttons");
const provinceContainer = document.getElementById("province-buttons");
const cityContainer = document.getElementById("city-buttons");

fetch(`${API_BASE_PATH}/getCountries`)
  .then(res => res.json())
  .then(countries => {
    countryContainer.innerHTML = "";
    countries.forEach(c => {
      const btn = document.createElement("button");
      btn.textContent = c.name;
      btn.onclick = () => selectCountry(c);
      countryContainer.appendChild(btn);
    });
  })
  .catch(err => console.error("Error fetching countries:", err));

function selectCountry(country) {
  selectedCountry = country;
  selectedProvince = null;
  selectedCity = null;

  // Display selected country
  document.getElementById("selected-country").textContent = country.name;
  // Clear and hide province & city selections
  document.getElementById("selected-province").textContent = "";
  document.getElementById("selected-city").textContent = "";
  document.getElementById("postalCode").value = "";

  // Hide country container (auto close)
  document.getElementById("country-container").style.display = "none";

  // Show province container
  const provinceDiv = document.getElementById("province-container");
  provinceDiv.style.display = "block";

  // Load provinces
  fetch(`${API_BASE_PATH}/getProvince?country_id=${country.id}`)
    .then(res => res.json())
    .then(provinces => {
      provinceContainer.innerHTML = "";
      provinces.forEach(p => {
        const btn = document.createElement("button");
        btn.textContent = p.name;
        btn.onclick = () => selectProvince(p);
        provinceContainer.appendChild(btn);
      });
    });
}

function selectProvince(province) {
  selectedProvince = province;
  selectedCity = null;

  // Display selected province
  document.getElementById("selected-province").textContent = province.name;
  // Clear city selection
  document.getElementById("selected-city").textContent = "";
  document.getElementById("postalCode").value = "";

  // Hide province container (auto close)
  document.getElementById("province-container").style.display = "none";

  // Show city container
  const cityDiv = document.getElementById("city-container");
  cityDiv.style.display = "block";

  // Load cities
  fetch(`${API_BASE_PATH}/getCities?province_id=${province.id}`)
    .then(res => res.json())
    .then(cities => {
      cityContainer.innerHTML = "";
      cities.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c.name;
        btn.onclick = () => selectCity(c);
        cityContainer.appendChild(btn);
      });
    });
}

function selectCity(city) {
  selectedCity = city;

  // Display selected city
  document.getElementById("selected-city").textContent = city.name;

  // Hide city container (auto close)
  document.getElementById("city-container").style.display = "none";

  // Show postal code
  document.getElementById("postalCode").value = city.postal_code || "";
}

window.submitSignup = function () {
  const payload = {
    first_name: document.getElementById('firstName').value.trim(),
    middle_name: document.getElementById('middleName').value.trim(),
    last_name: document.getElementById('lastName').value.trim(),
    email: document.getElementById('signupEmail').value.trim(),
    password: document.getElementById('signupPass').value,
    phone: document.getElementById('signupPhone').value.trim(),
    street: document.getElementById('street').value.trim(),
    city: selectedCity?.name || '',
    province: selectedProvince?.name || '',
    postal_code: document.getElementById('postalCode').value.trim(),
    country: selectedCountry?.name || ''
  };

  signup(payload);
};

window.goBack = function () {
  history.back();
};
