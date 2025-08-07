<?php
require_once dirname(__DIR__, 2) . '/model/topselling.php';

function getTopSellingItems($con) {
    $model = new TopSelling($con);
    $items = $model->fetchTopSellingItems();

    header('Content-Type: application/json');
    echo json_encode(["status" => true, "data" => $items]);
}
