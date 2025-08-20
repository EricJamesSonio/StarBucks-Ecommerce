// signup.js
import { API_BASE_PATH } from "./config.js";

class SignupManager {
    constructor(apiBasePath) {
        this.apiBasePath = apiBasePath;
        this.selectedCountry = null;
        this.selectedProvince = null;
        this.selectedCity = null;

        this.countryContainer = document.getElementById("country-buttons");
        this.provinceContainer = document.getElementById("province-buttons");
        this.cityContainer = document.getElementById("city-buttons");

        console.log("signup.js loaded, initializing...");
        this.loadCountries();
    }

    async loadCountries() {
        try {
            const res = await fetch(`${this.apiBasePath}/getCountries`);
            const countries = await res.json();
            this.renderButtons(this.countryContainer, countries, country => this.selectCountry(country));
        } catch (err) {
            console.error("Error fetching countries:", err);
        }
    }

    async selectCountry(country) {
        this.selectedCountry = country;
        this.selectedProvince = null;
        this.selectedCity = null;

        document.getElementById("selected-country").textContent = country.name;
        document.getElementById("selected-province").textContent = "";
        document.getElementById("selected-city").textContent = "";
        document.getElementById("postalCode").value = "";

        document.getElementById("country-container").style.display = "none";
        document.getElementById("province-container").style.display = "block";

        try {
            const res = await fetch(`${this.apiBasePath}/getProvince?country_id=${country.id}`);
            const provinces = await res.json();
            this.renderButtons(this.provinceContainer, provinces, province => this.selectProvince(province));
        } catch (err) {
            console.error("Error fetching provinces:", err);
        }
    }

    async selectProvince(province) {
        this.selectedProvince = province;
        this.selectedCity = null;

        document.getElementById("selected-province").textContent = province.name;
        document.getElementById("selected-city").textContent = "";
        document.getElementById("postalCode").value = "";

        document.getElementById("province-container").style.display = "none";
        document.getElementById("city-container").style.display = "block";

        try {
            const res = await fetch(`${this.apiBasePath}/getCities?province_id=${province.id}`);
            const cities = await res.json();
            this.renderButtons(this.cityContainer, cities, city => this.selectCity(city));
        } catch (err) {
            console.error("Error fetching cities:", err);
        }
    }

    selectCity(city) {
        this.selectedCity = city;
        document.getElementById("selected-city").textContent = city.name;
        document.getElementById("city-container").style.display = "none";
        document.getElementById("postalCode").value = city.postal_code || "";
    }

    renderButtons(container, items, onClick) {
        container.innerHTML = "";
        items.forEach(item => {
            const btn = document.createElement("button");
            btn.textContent = item.name;
            btn.onclick = () => onClick(item);
            container.appendChild(btn);
        });
    }

    submitSignup() {
        const payload = {
            first_name: document.getElementById('firstName').value.trim(),
            middle_name: document.getElementById('middleName').value.trim(),
            last_name: document.getElementById('lastName').value.trim(),
            email: document.getElementById('signupEmail').value.trim(),
            password: document.getElementById('signupPass').value,
            phone: document.getElementById('signupPhone').value.trim(),
            street: document.getElementById('street').value.trim(),
            city: this.selectedCity?.name || '',
            province: this.selectedProvince?.name || '',
            postal_code: document.getElementById('postalCode').value.trim(),
            country: this.selectedCountry?.name || ''
        };

        signup(payload); // Assuming signup is globally available
    }

    goBack() {
        history.back();
    }
}

// Create singleton
export const signupManager = new SignupManager(API_BASE_PATH);

// Keep compatibility with existing HTML event attributes
window.selectCountry = (country) => signupManager.selectCountry(country);
window.selectProvince = (province) => signupManager.selectProvince(province);
window.selectCity = (city) => signupManager.selectCity(city);
window.submitSignup = () => signupManager.submitSignup();
window.goBack = () => signupManager.goBack();
