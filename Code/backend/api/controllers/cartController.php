<?php
ini_set('display_errors', 1);
ini_set('html_errors', 0);
header("Content-Type: application/json");
error_reporting(E_ALL);

require_once dirname(__DIR__, 2) . '/model/Cart.php';
require_once dirname(__DIR__, 3) . '/database/db2.php';

function handleCart($con) {
    session_start();

    $method = $_SERVER['REQUEST_METHOD'];
    $isLoggedIn = isset($_SESSION['user_id']);
    $userId = $isLoggedIn ? (int) $_SESSION['user_id'] : null;

    $cartModel = new Cart($con);

    switch ($method) {
        case 'GET':
    if ($isLoggedIn) {
        echo json_encode($cartModel->getCartItems($userId));
    } else if (!empty($_SESSION['guest_token'])) {
        echo json_encode($cartModel->getCartItemsByGuestToken($_SESSION['guest_token']));
    } else {
        echo json_encode([]);
    }
    return;


        case 'POST':
            $payload = json_decode(file_get_contents('php://input'), true);

            if (!is_array($payload)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid JSON payload"]);
                return;
            }

            $itemId   = filter_var($payload['item_id'] ?? null, FILTER_VALIDATE_INT);
            $sizeId   = isset($payload['size_id']) ? filter_var($payload['size_id'], FILTER_VALIDATE_INT) : null;
            $quantity = filter_var($payload['quantity'] ?? null, FILTER_VALIDATE_INT, [
                'options' => ['min_range' => 1]
            ]);
            $unitPrice = filter_var($payload['unit_price'] ?? null, FILTER_VALIDATE_FLOAT);

            if (!$itemId || !$quantity) {
                http_response_code(400);
                echo json_encode(["error" => "Missing item_id or quantity"]);
                return;
            }

            $guestToken = $_SESSION['guest_token'] ?? null;
if (!$isLoggedIn) {
    if (!$guestToken) {
        $guestToken = bin2hex(random_bytes(16)); // ✅ generate once
        $_SESSION['guest_token'] = $guestToken;
    }
}

// Now save to database regardless of login:
if ($userId !== null || $guestToken !== null) {
    $ok = $cartModel->addOrUpdateCartItem($userId, $guestToken, $itemId, $sizeId, $quantity);
    if ($ok) {
        echo json_encode(["success" => true, "message" => "Item added to cart"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Failed to add item"]);
    }
    return;
}

      
             else {
                // 🧑 Guest: save to session only
                if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

                $found = false;
                foreach ($_SESSION['cart'] as &$item) {
                    if ($item['item_id'] === $itemId && ($item['size_id'] ?? null) === $sizeId) {
                        $item['quantity'] += $quantity;
                        $found = true;
                        break;
                    }
                }

                if (!$found) {
                    $_SESSION['cart'][] = [
                        "item_id" => $itemId,
                        "size_id" => $sizeId,
                        "quantity" => $quantity,
                        "price" => $unitPrice
                    ];
                }

                echo json_encode(["success" => true, "message" => "Item added to guest cart"]);
                return;
            }

        case 'DELETE':
            if ($isLoggedIn && $userId !== null) {
                $cartModel->clearCart($userId);
            }
            unset($_SESSION['cart']); // Clear guest cart too
            echo json_encode(["success" => true, "message" => "Cart cleared"]);
            return;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            return;
    }
}
