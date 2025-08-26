<?php

require_once dirname(__DIR__, 2) . '/model/Merchandise.php';

function getMerchandise($con) {
    header('Content-Type: application/json');
    try {
        $subcategory_id = isset($_GET['subcategory_id']) ? intval($_GET['subcategory_id']) : 0;

        $merchandiseModel = new Merchandise($con);
        $items = $merchandiseModel->getFilteredMerchandise($subcategory_id);

        echo json_encode([
            "status" => true,
            "data" => $items
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode([
            "status" => false,
            "message" => "Failed to load merchandise",
            "error" => $e->getMessage()
        ]);
    }
}
