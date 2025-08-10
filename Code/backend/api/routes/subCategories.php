<?php
require_once __DIR__ . '/../controllers/subcategoryController.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    getSubcategories($con); // call controller function
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
