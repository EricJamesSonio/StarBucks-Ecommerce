<?php
// Prevent HTML output in errors (important for JSON response)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('html_errors', 0); 

// Always return JSON
header("Content-Type: application/json");

// Safely start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once dirname(__DIR__, 2) . '/model/Order.php';
require_once dirname(__DIR__, 3) . '/database/db2.php';

function handleCheckout($con) {
    try {
        // Read and decode JSON payload
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true);

        // If JSON decode fails
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid JSON input"]);
            return;
        }

        $items = $data['items'] ?? [];
        $discount = $data['discount'] ?? 0;

        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(["message" => "Not logged in"]);
            return;
        }

        // Check if there are items in the order
        if (empty($items)) {
            http_response_code(400);
            echo json_encode(["message" => "No items in order"]);
            return;
        }

        $userId = $_SESSION['user_id'];
        $orderModel = new Order($con);
        $orderId = $orderModel->saveOrder($userId, $items, $discount);

        if ($orderId) {
            echo json_encode(["message" => "Checkout successful!", "order_id" => $orderId]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Something went wrong saving the order."]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Server error", "error" => $e->getMessage()]);
    }
}
