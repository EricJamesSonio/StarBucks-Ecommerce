<?php
require_once(__DIR__ . '/../../db2.php');
require_once(__DIR__ . '/../function.php');


// Get category IDs
$drinkId = $con->query("SELECT id FROM category WHERE name = 'Drink'")->fetch_assoc()['id'];
$sandwichId = $con->query("SELECT id FROM category WHERE name = 'Sandwich'")->fetch_assoc()['id'];

insertData($con, 'subcategory', ['category_id', 'name'], [
    [$drinkId, 'Espresso'],
    [$drinkId, 'Tea'],
    [$drinkId, 'Fruity'],
    [$sandwichId, 'Egg'],
    [$sandwichId, 'Bacon'],
    [$sandwichId, 'Cheddar']
],); 
?>
