<?php
require_once dirname(__DIR__, 2) . '/model/item.php';

function getItems($con) {
    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    $subcategory_id = isset($_GET['subcategory_id']) ? intval($_GET['subcategory_id']) : 0;

    $itemModel = new Item($con);
    $items = $itemModel->getFilteredItems($category_id, $subcategory_id);

    header('Content-Type: application/json');
    echo json_encode([
        "status" => true,
        "data" => $items
    ]);
}

?>
