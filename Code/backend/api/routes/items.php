<?php
require_once __DIR__ . '/../controllers/itemController.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    getItems($con); // call controller function
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["message" => "Method not allowed"]);
}

