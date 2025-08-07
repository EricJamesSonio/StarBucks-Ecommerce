<?php
require_once dirname(__DIR__, 2) . '/model/item.php';

function getItems($con) {
    $itemModel = new Item($con);
    $items = $itemModel->getAllItems();

    header('Content-Type: application/json');
    echo json_encode($items);
}
?>
