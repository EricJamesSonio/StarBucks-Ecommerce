<?php

require_once(__DIR__ . '/../db2.php');
require_once(__DIR__ . '/../scripts/function.php');

// Category Table (Drink, Sandwich)
createTable($con, 'address', "
    CREATE TABLE address (
        id INT AUTO_INCREMENT PRIMARY KEY,
        addressable_type ENUM('user','admin') NOT NULL,
        addressable_id INT NOT NULL,
        street VARCHAR(255),
        city VARCHAR(100),
        province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        CONSTRAINT fk_address_unique UNIQUE (addressable_type, addressable_id)
    )

");




?>