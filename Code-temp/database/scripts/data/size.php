<?php

require_once(__DIR__ . '/../../db2.php');
require_once(__DIR__ . '/../function.php');

// Define Starbucks drink sizes with optional price modifiers
$sizes = [
    ['Tall', 0.00],
    ['Grande', 10.00],
    ['Venti', 20.00]
];

// Prepare data for bulk insert
$sizeRows = [];
foreach ($sizes as [$name, $modifier]) {
    $sizeRows[] = [$name, $modifier];
}

// Insert into `size` table
insertData($con, 'size', ['name', 'price_modifier'], $sizeRows);

?>
