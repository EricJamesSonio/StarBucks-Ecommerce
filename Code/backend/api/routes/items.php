<?php

require_once __DIR__ . '/../controllers/itemController.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getItems($con);
        break;

    case 'POST':
        $action = $_GET['action'] ?? '';
        if ($action === 'add') {
            addItem($con);
        } elseif ($action === 'update') {
            updateItem($con);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Invalid action"]);
        }
        break;

    case 'DELETE':
        deleteItem($con);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
}
