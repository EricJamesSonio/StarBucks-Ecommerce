<?php
require_once dirname(__DIR__, 2) . '/model/subcategory.php';

function getSubcategories($con) {
    // Get category_id from query param
    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    if (!$category_id) {
        http_response_code(400);
        echo json_encode(["status" => false, "message" => "category_id is required"]);
        return;
    }

    $subcategoryModel = new Subcategory($con);
    $subcategories = $subcategoryModel->getByCategoryId($category_id);

    header('Content-Type: application/json');
    echo json_encode([
        "status" => true,
        "data" => $subcategories
    ]);
}
