<?php
header('Content-Type: application/json');

// Ensure DB connection exists even if this file is accessed directly (not via index router)
if (!isset($con)) {
    require_once dirname(__DIR__, 3) . '/database/db2.php';
}

require_once __DIR__ . '/../controllers/merchandiseController.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getMerchandise($con);
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
}
