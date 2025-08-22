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

        this.signupBtn = document.getElementById("signupBtn");

        // Inputs
        this.firstName = document.getElementById("firstName");
        this.middleName = document.getElementById("middleName");
        this.lastName = document.getElementById("lastName");
        this.email = document.getElementById("signupEmail");
        this.password = document.getElementById("signupPass");
        this.phone = document.getElementById("signupPhone");

        // Add live validation
        this.addValidationListeners();

        console.log("signup.js loaded, initializing...");
        this.loadCountries();
    }

    // Regex Validators
    isValidName(name) {
        return /^[A-Za-z\s]+$/.test(name);
    }

    isValidEmail(email) {
    // Basic RFC-like check: something@something.something
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


    isValidPhone(phone) {
    // Match 09XXXXXXXXX (11 digits) OR +63XXXXXXXXXX (13 chars total)
    return /^(09\d{9}|\+63\d{10})$/.test(phone);
}


    addValidationListeners() {
        const fields = [
            { input: this.firstName, validator: this.isValidName, errorId: "firstNameError", message: "Only letters and spaces allowed" },
            { input: this.middleName, validator: this.isValidName, errorId: "middleNameError", message: "Only letters and spaces allowed" },
            { input: this.lastName, validator: this.isValidName, errorId: "lastNameError", message: "Only letters and spaces allowed" },
            { input: this.email, validator: this.isValidEmail, errorId: "emailError", message: "Enter a valid email (gmail, yahoo, email)" },
            { input: this.phone, validator: this.isValidPhone, errorId: "phoneError", message: "Enter a valid PH number (09XXXXXXXXX or +63XXXXXXXXXX)" }

        ];

        fields.forEach(({ input, validator, errorId, message }) => {
            let errorEl = document.getElementById(errorId);
            if (!errorEl) {
                errorEl = document.createElement("small");
                errorEl.id = errorId;
                errorEl.style.color = "red";
                input.insertAdjacentElement("afterend", errorEl);
            }

            input.addEventListener("input", () => {
                if (!validator.call(this, input.value.trim()) && input.value.trim() !== "") {
                    errorEl.textContent = message;
                } else {
                    errorEl.textContent = "";
                }
                this.toggleSignupButton();
            });
        });
    }

    toggleSignupButton() {
        const valid =
            this.isValidName(this.firstName.value.trim()) &&
            (this.middleName.value.trim() === "" || this.isValidName(this.middleName.value.trim())) &&
            this.isValidName(this.lastName.value.trim()) &&
            this.isValidEmail(this.email.value.trim()) &&
            this.isValidPhone(this.phone.value.trim());

        this.signupBtn.disabled = !valid;
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
        if (this.signupBtn.disabled) return; // Prevent submission if invalid

        const payload = {
            first_name: this.firstName.value.trim(),
            middle_name: this.middleName.value.trim(),
            last_name: this.lastName.value.trim(),
            email: this.email.value.trim(),
            password: this.password.value,
            phone: this.phone.value.trim(),
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
