<?php

require_once(__DIR__ . '/../db2.php');
require_once(__DIR__ . '/../scripts/function.php');

// Starbucks Items Table
createTable($con, 'starbucksitem', "
    CREATE TABLE starbucksitem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT DEFAULT 0,
        category_id INT NOT NULL,
        subcategory_id INT NOT NULL,
        description TEXT,
        image_url VARCHAR(255), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES category(id),
        FOREIGN KEY (subcategory_id) REFERENCES subcategory(id)
    )
");


?>
