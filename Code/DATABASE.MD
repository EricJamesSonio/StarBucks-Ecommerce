******************************* DATABASE SUMMARY **********************************

[model]         --> contains Table for DATABASE
    attributes_template     --> Coffeine level etc.
    category                --> Drinks, Sandwich etc.
    itemattributes          --> Contains Attribute templates and starcbucksitem linked
    starbucksitem           --> Base Item
    subcategory             --> Drinks = Expresso
    contacts                --> Email, Phone
    supplier                --> Base Details of Ingredient Suppliers
    user                    --> User of website "Customer"
    admin                   --> Manager
    auth                    --> Logins (user, admin)
    address                 --> Location (user, admin) for delivery & supply purposes
    userorder               --> Individual order itself contains price & quantity
    order_item              --> contains the userorders to combine all and can get the total price etc.
    receipt                 --> Contains receipt of the order (payment, change etc.)
    discount                --> contains pwd, senior, store discounts apply to the total price!

StarbucksItem -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT DEFAULT 0,
        category_id INT NOT NULL,
        subcategory_id INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES category(id),
        FOREIGN KEY (subcategory_id) REFERENCES subcategory(id)

Category -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Subcategory --> 
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        category_id INT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE

Attribute Templates -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

Item Attributes --> 
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        attribute_template_id INT NOT NULL,
        attribute_value VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES starbucksitem(id) ON DELETE CASCADE,
        FOREIGN KEY (attribute_template_id) REFERENCES attribute_template(id) ON DELETE CASCADE

Supplier -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Admin -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        middle_name VARCHAR(50),
        last_name VARCHAR(50) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

User -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        middle_name VARCHAR(50),
        last_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Auth -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_type ENUM('user', 'admin') NOT NULL,
        account_id INT NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uniq_auth_account UNIQUE (account_type, account_id),
        INDEX idx_auth_type_id (account_type, account_id)

Contact -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        contactable_type ENUM( 'user', 'admin') NOT NULL,
        contactable_id INT NOT NULL,
        contact_type ENUM('email', 'phone') NOT NULL,
        value VARCHAR(100) NOT NULL,
        UNIQUE (contactable_type, contactable_id, contact_type, value),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Address -->
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        addressable_type ENUM('user','admin') NOT NULL,
        addressable_id INT UNSIGNED NOT NULL,
        street VARCHAR(255),
        country_id INT UNSIGNED,
        province_id INT UNSIGNED,
        city_id INT UNSIGNED,
        CONSTRAINT fk_address_unique UNIQUE (addressable_type, addressable_id),
        FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE SET NULL,
        FOREIGN KEY (province_id) REFERENCES province(id) ON DELETE SET NULL,
        FOREIGN KEY (city_id) REFERENCES city(id) ON DELETE SET NULL

Userorder --> 
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        
Orderitem -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES `userorder`(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES starbucksitem(id) ON DELETE CASCADE

Receipts -->
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        discount_type ENUM('none', 'senior', 'store_card', 'custom') DEFAULT 'none',
        discount_value DECIMAL(5,2) DEFAULT 0.00, -- percentage like 10.00 or 12.00
        discount_amount DECIMAL(10,2) DEFAULT 0.00, -- actual amount deducted
        final_amount DECIMAL(10,2) NOT NULL, -- total after discount
        payment_amount DECIMAL(10,2) NOT NULL, -- amount customer paid
        change_amount DECIMAL(10,2) GENERATED ALWAYS AS (payment_amount - final_amount) STORED,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES userorder(id) ON DELETE CASCADE

Discount 
    CREATE TABLE discount (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL, -- 'Senior', 'PWD', etc.
        description TEXT,
        discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0.00 AND discount_percentage <= 100.00),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )

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







[scripts]

db.php          --> Database creation 

set.php         --> Executing the creation of TABLES and pre defined fields in DATABASE

[functions]

createTable     --> Create The Tables in the Database only Onced and Updates for deleted rows or added rows   
insertData      --> Insert pre defined fields only onced
upsertData      --> Can be use for manually updating Tables
getIDbyName     --> Get id from different tables by name (Used for creating tables that is required foreign keys)


**************************************** NORMALIZATION DESIGN DATABASE *************************************

[User] -----------------|----------------------|
                        |                      |----[Auth] --> Logins
[Admin]-----------------|----------------------|
                        |-------- [Contacts] --> Phones, Emails ---- [Address]
[Supplier]--------------|

--------------------------------------------------------------------------------
[Contacts] --- Phone, Emails
        [User],[Admin],[Supplier]

[Auth] --- Login Password username 
        [User], [Admin]

[Address] -- Location
        [User], [Admin]

---------------------------------------------------------------------------------

[item attributes]

--> [attribute templates] 
        --> cafeine level etc. default to medium


