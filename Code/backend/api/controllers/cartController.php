<?php
ini_set('display_errors', 1);
ini_set('html_errors', 0);
header("Content-Type: application/json");
error_reporting(E_ALL);

require_once dirname(__DIR__, 2) . '/model/cart.php';
require_once dirname(__DIR__, 3) . '/database/db2.php';

function handleCart($con) {
    session_start();

    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["error" => "Not authenticated"]);
        return;
    }

    $cartModel = new Cart($con);
    $userId    = (int) $_SESSION['user_id'];
    $method    = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            echo json_encode($cartModel->getCartItems($userId));
            return;

        case 'POST':
            $payload = json_decode(file_get_contents('php://input'), true);

            $itemId   = filter_var($payload['item_id'] ?? null, FILTER_VALIDATE_INT);
            $sizeId   = isset($payload['size_id']) ? filter_var($payload['size_id'], FILTER_VALIDATE_INT) : null;
            $quantity = filter_var($payload['quantity'] ?? null, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1]
            ]);

            if (!$itemId || !$quantity) {
                http_response_code(400);
                echo json_encode(["error" => "Missing item_id or quantity"]);
                return;
            }

            $ok = $cartModel->addOrUpdateCartItem($userId, $itemId, $sizeId, $quantity);

            if ($ok) {
                echo json_encode(["success" => true, "message" => "Item added to cart"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to add item"]);
            }
            return;

        case 'DELETE':
            $cartModel->clearCart($userId);
            echo json_encode(["success" => true, "message" => "Cart cleared"]);
            return;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            return;
    }
}
