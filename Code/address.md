
routes/getCities.php 
<?php
require_once dirname(__DIR__, 3) . '/database/db2.php';

header('Content-Type: application/json');

$provinceId = isset($_GET['province_id']) ? intval($_GET['province_id']) : 0;
$stmt = $con->prepare("SELECT id, name, postal_code FROM city WHERE province_id = ? ORDER BY name ASC");
$stmt->bind_param("i", $provinceId);
$stmt->execute();
$res = $stmt->get_result();
echo json_encode($res->fetch_all(MYSQLI_ASSOC));

routes/getCountries.php

<?php
require_once dirname(__DIR__, 3) . '/database/db2.php';

header('Content-Type: application/json');

$result = $con->query("SELECT id, name FROM country ORDER BY name ASC");
echo json_encode($result->fetch_all(MYSQLI_ASSOC));

routes/getProvince.php

<?php
require_once dirname(__DIR__, 3) . '/database/db2.php';

header('Content-Type: application/json');

$countryId = isset($_GET['country_id']) ? intval($_GET['country_id']) : 0;
$stmt = $con->prepare("SELECT id, name FROM province WHERE country_id = ? ORDER BY name ASC");
$stmt->bind_param("i", $countryId);
$stmt->execute();
$res = $stmt->get_result();
echo json_encode($res->fetch_all(MYSQLI_ASSOC));

then signup.js
import { API_BASE_PATH } from "./config.js";

let selectedCountry = null;
let selectedProvince = null;
let selectedCity = null;

fetch(`${API_BASE_PATH}/getCountries`)
  .then(res => res.json())
  .then(countries => {
    console.log("Countries from API:", countries); // <- See if it's empty or error
    const container = document.getElementById("country-buttons");
    countries.forEach(c => {
      const btn = document.createElement("button");
      btn.textContent = c.name;
      btn.onclick = () => selectCountry(c);
      container.appendChild(btn);
    });
  })
  .catch(err => console.error("Error fetching countries:", err));


function selectCountry(country) {
  selectedCountry = country;
  selectedProvince = null;
  selectedCity = null;
  document.getElementById("province-container").style.display = "block";
  document.getElementById("city-container").style.display = "none";
  document.getElementById("postalCode").value = "";

  fetch(`${API_BASE_PATH}/getProvince?country_id=${country.id}`)
    .then(res => res.json())
    .then(provinces => {
      const container = document.getElementById("province-buttons");
      container.innerHTML = "";
      provinces.forEach(p => {
        const btn = document.createElement("button");
        btn.textContent = p.name;
        btn.onclick = () => selectProvince(p);
        container.appendChild(btn);
      });
    });
}

function selectProvince(province) {
  selectedProvince = province;
  selectedCity = null;
  document.getElementById("city-container").style.display = "block";
  document.getElementById("postalCode").value = "";

  fetch(`${API_BASE_PATH}/getCities?province_id=${province.id}`)
    .then(res => res.json())
    .then(cities => {
      const container = document.getElementById("city-buttons");
      container.innerHTML = "";
      cities.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c.name;
        btn.onclick = () => selectCity(c);
        container.appendChild(btn);
      });
    });
}

function selectCity(city) {
  selectedCity = city;
  document.getElementById("postalCode").value = city.postal_code || "";
}

window.signup = function () {
  const payload = {
  first_name: document.getElementById('firstName').value,
  middle_name: document.getElementById('middleName').value,
  last_name: document.getElementById('lastName').value,
  email: document.getElementById('signupEmail').value,
  password: document.getElementById('signupPass').value,
  phone: document.getElementById('signupPhone').value,
  street: document.getElementById('street').value,
  city: selectedCity?.name || '',
  province: selectedProvince?.name || '',
  postal_code: document.getElementById('postalCode').value,
  country: selectedCountry?.name || ''
};


  fetch(`${API_BASE_PATH}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(result => {
      alert(result.message);
    })
    .catch(err => {
      console.error(err);
      alert('Error during signup');
    });
};

window.goBack = function () {
  history.back();
};

window.API_BASE_PATH = `${window.location.origin}/starbucks-ecommerce/code/api`;

js/config.js

export const API_BASE_PATH = `${window.location.origin}/starbucks-ecommerce/code/api`;
window.API_BASE_PATH = API_BASE_PATH;
signup-form.html

<h2>Sign Up</h2>
<input id="firstName" placeholder="First Name" />
<input id="middleName" placeholder="Middle Name" />
<input id="lastName" placeholder="Last Name" />
<input id="signupEmail" placeholder="Email" />
<input id="signupPass" type="password" placeholder="Password" />
<input id="signupPhone" placeholder="Phone" />
<input id="street" placeholder="Street" />

<!-- Address selection -->
<div id="country-container">
  <h3>Select Country</h3>
  <div id="country-buttons"></div>
</div>

<div id="province-container" style="display:none;">
  <h3>Select Province</h3>
  <div id="province-buttons"></div>
</div>

<div id="city-container" style="display:none;">
  <h3>Select City</h3>
  <div id="city-buttons"></div>
</div>

<input id="postalCode" placeholder="Postal Code" readonly />

<button onclick="signup()">Sign Up</button>
<button onclick="goBack()">Back</button>

<!-- Load signup.js -->
<script type="module" src="js/signup.js"></script>

config.js

import { API_BASE_PATH } from "../../js/config.js";

export const LOGIN_ENDPOINT = `${API_BASE_PATH}/login`;
export const SIGNUP_ENDPOINT = `${API_BASE_PATH}/signup`;

and the api base path is = export const API_BASE_PATH = `${window.location.origin}/starbucks-ecommerce/code/api`; which results to backend/api/index.php(Main api entry)/ 


then the folder structure Main folder - Starbucks-ecommerce

Main folder - Starbucks-ecommerce

Code/
├── api/
│   ├── .htaccess 
├── backend/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── itemController.php
│   │   │   ├── checkoutController.php
│   │   │   ├── loginController.php
│   │   │   ├── paymentController.php
│   │   │   ├── signupController.php
│   │   │   └── sizeController.php
|   |   |   └── historyController.php
│   │   │
│   │   ├── routes/
│   │   │   ├── items.php
│   │   │   ├── check_login.php
│   │   │   ├── checkout.php
│   │   │   ├── login.php
│   │   │   ├── orders.php
│   │   │   ├── payment.php
│   │   │   ├── receipt.php
│   │   │   ├── signup.php
│   │   │   └── sizes.php
|   |   |   └── history.php
│   │   │
│   │   ├── tcpdf/                # Library for PDF receipts
│   │   └── index.php             # Entry point of backend API
│   │
│   └── model/
│       ├── Address.php
│       ├── Auth.php
│       ├── Contact.php
│       ├── Item.php
│       ├── Order.php
│       ├── Payment.php
│       ├── Size.php
│       └── User.php
│       └── Cart.php
│
├── database/
│   ├── model/
│   │   ├── address.php
│   │   ├── admins.php
│   │   ├── attributes_template.php
│   │   ├── auth.php
│   │   ├── category.php
│   │   ├── contacts.php
│   │   ├── itemattributes.php
│   │   ├── orderitems.php
│   │   ├── receipts.php
│   │   ├── size.php
│   │   ├── starbucksitem.php
│   │   ├── subcategoryitems.php
│   │   ├── user_order.php
│   │   └── users.php
│   │   └── cart_items.php
│   │
│   ├── scripts/
│   │   └── data/                 # Contains actual data to inject
│   │   └── function.php          # contains function used in creating table 
│   │
│   ├── db2.php                   # Database configuration (&con)
│   └── seed.php                  # Script for seeding database
│
├── design/ = Actual frontend
│   ├── assets/
│   ├── home/
│   │   ├── assets/
│   │   ├── cart.js
│   │   ├── main.js -- bootstraping of js functions
│   │   ├── modal.js
│   │   ├── payment.js
│   │   ├── session.js
│   │   ├── history.js
├── frontend/ -- used for directing buttons in design/ home
│   ├── js/
│   │   ├── api.js
│   │   ├── cart.js
│   │   ├── main.js -- bootstraping of js functions
│   │   ├── modal.js
│   │   ├── payment.js
│   │   ├── session.js
│   │   ├── history.js
│   │   ├── config.js - export const API_BASE_PATH = `${window.location.origin}/code/api/`;
│   ├
│   ├── menu/
|   │   ├── images/
│   │   ├── menu.html   # calls main.js in js folder 
│   │   ├── menu.css   
│   │   ├── menuMain.js # just for logout only
|   |
│   ├── history/
|   │   ├── history.html  -- calls the history.js in js folder
│   │   ├── history.css  
│   ├── cart/
│   │   ├── cart.html
│   │   ├── cart.css
│   │   ├── cartMain.js
│   ├
│   ├── login/
│   │   ├── login.html
│   │   ├── loginMain.js
│   │ 
|   │   ├── css/
|   │   │   ├── login.css
|   │   
|   │   ├── js/
|   │   │   ├── config.js
|   │   │   ├── auth.js
|   │   │   ├── init.js
|   │   │   ├── signup.js
|   │ 
|   │   ├── components/
|   │   │   
|   │   │   ├── login-form.html
|   │   │   ├── signup-form.html
|   │   │   ├── start-screen.html


here is the login.html <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Starbucks POS – Login or Sign Up</title>
   
  <link rel="stylesheet" href="login.css" />
</head>
<body>
  <button class="back-button" onclick="window.location.href='../../design/home/index.html'">Back</button>

  <div class="container">
    <div id="component-root"></div>
    <div id="errorMsg" class="error-msg"></div>
  </div>

  <!-- Load init script -->
<script type="module" src="js/init.js"></script>
</body>
</html>

and here is the database table 
\
City -->
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        province_id INT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        FOREIGN KEY (province_id) REFERENCES province(id) ON DELETE CASCADE

Country -->

        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE

Province -->

        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        country_id INT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE





