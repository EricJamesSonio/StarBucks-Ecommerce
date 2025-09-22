// headerTemplate.js - HTML template for the header component
export const headerHTML = `
    <ul id="head-nav">
        <li class="logo-container">
            <img class="logo" src="../assets/starbucksLogo-nocircle.png" alt="starbucks" onclick="window.location.href='../home/home.html'">
        </li>
        <li class="nav-list">
            <nav>
                <a href="../home/home.html">Home</a>
                <a href="../menu/menu.html">Menu</a>
                <a href="../aboutUs/aboutUs.html">About Us</a>
                <a href="../../frontend/admin/panel/panel.html" id="admin-link" style="display:none;">Admin Dashboard</a>
            </nav>
        </li>
        <li class="icon-list-container">
            <ul id="icon-list">
                <li>
                    <a href="../cart/cart.html">
                        <img class="icon" src="../assets/shopping-cart.png" alt="cart">
                    </a>
                </li>
                <li>
                    <img class="icon" id="profile-icon" src="../assets/user.png" alt="user">
                </li>
                <li>
                    <button onclick="window.location.href='../login/login.html'">SIGN UP</button>
                </li>
            </ul>
        </li>
    </ul>


    <!-- Profile Modal -->
    <div id="profile-modal" class="modal">
        <div class="modal-content">
            <span id="close-profile" class="close">&times;</span>
            <h2>User Profile</h2>
            <img id="profile-image" src="../assets/user.png" alt="Profile" width="100">
            <label for="profile-image-url">Profile Image URL</label>
            <input type="text" id="profile-image-url" placeholder="Enter image URL">
            <button id="open-image-picker">Choose from Gallery</button>

            <form id="profile-form">
                <label>First Name</label>
                <input type="text" id="first_name" name="first_name">
                <label>Middle Name</label>
                <input type="text" id="middle_name" name="middle_name">
                <label>Last Name</label>
                <input type="text" id="last_name" name="last_name">
                <h3>Address</h3>
                <input type="text" id="street" placeholder="Street">
                <label for="country">Country</label>
                <select id="country"></select>
                <label for="province">Province</label>
                <select id="province"></select>
                <label for="city">City</label>
                <select id="city"></select>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    </div>
`;
