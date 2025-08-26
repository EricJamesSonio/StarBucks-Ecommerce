<?php
class Payment {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function saveReceipt($type, $paid, $total, $discount, $final) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $now = date('Y-m-d H:i:s');

    // 1. Get current user (required for orders)
    if (!isset($_SESSION['user_id'])) {
        return ['success' => false, 'error' => 'User not logged in.'];
    }

    $userId = $_SESSION['user_id'];
    require_once dirname(__DIR__) . '/model/Cart.php'; // correct case
$cartModel = new Cart($this->con);
$cart = $cartModel->getCartItems($userId);

if (empty($cart)) {
    return ['success' => false, 'error' => 'Cart is empty.'];
}

    // 2. Insert new userorder
    $stmt = $this->con->prepare("INSERT INTO userorder (user_id, total_amount, status, placed_at, updated_at) VALUES (?, ?, 'pending', ?, ?)");
    $stmt->bind_param("idss", $userId, $total, $now, $now);
    if (!$stmt->execute()) {
        return ['success' => false, 'error' => 'Failed to insert userorder.'];
    }
    // Use connection insert_id instead of stmt->insert_id
    $orderId = $this->con->insert_id;
    $stmt->close();

    // 3. Insert order items (include size_id and item_type when available)
    foreach ($cart as $item) {
        $itemId    = $item['item_id'] ?? $item['id'];  // safer
        $qty       = (int)$item['quantity'];
        $unitPrice = $item['price'];  // Use the calculated price from cart (includes size modifier)
        $sizeId    = isset($item['size_id']) ? $item['size_id'] : null; // nullable
        $itemType  = $item['item_type'] ?? 'starbucksitem'; // Default to starbucksitem for backward compatibility

        // Try with item_type first, fallback to old schema if column doesn't exist
        $stmt = $this->con->prepare("INSERT INTO order_item (order_id, item_id, item_type, size_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            // Fallback to old schema without item_type
            $stmt = $this->con->prepare("INSERT INTO order_item (order_id, item_id, size_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)");
            if (!$stmt) {
                return ['success' => false, 'error' => 'Failed to prepare order_item insert.'];
            }
            $stmt->bind_param("iiiid", $orderId, $itemId, $sizeId, $qty, $unitPrice);
        } else {
            // New schema with item_type
            $stmt->bind_param("iisiid", $orderId, $itemId, $itemType, $sizeId, $qty, $unitPrice);
        }
        
        if (!$stmt->execute()) {
            return ['success' => false, 'error' => 'Failed to insert order item: ' . $stmt->error];
        }
        $stmt->close();
    }

    // 4. Calculate values
    $discountAmount = $total - $final;
    $change = $paid - $final;

    // 5. Insert receipt
    // Map provided $type (payment method) to a valid discount_type enum
    $validDiscountTypes = ['none', 'senior', 'store_card', 'custom'];
    $discountTypeForInsert = in_array($type, $validDiscountTypes, true) ? $type : 'none';

    $stmt = $this->con->prepare("INSERT INTO receipt (
        order_id, discount_type, discount_value, discount_amount,
        final_amount, payment_amount, change_amount, issued_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        return ['success' => false, 'error' => 'Failed to prepare receipt insert'];
    }

    $stmt->bind_param("isddddds", $orderId, $discountTypeForInsert, $discount, $discountAmount, $final, $paid, $change, $now);

    if (!$stmt->execute()) {
        return ['success' => false, 'error' => 'Failed to insert receipt'];
    }

    // Use connection insert_id instead of stmt->insert_id
    $receiptId = $this->con->insert_id;
    $stmt->close();

    // 6. Generate and update receipt code
    $receiptCode = "RCPT-" . date('Ymd') . '-' . str_pad($receiptId, 4, '0', STR_PAD_LEFT);
    $stmt = $this->con->prepare("UPDATE receipt SET receipt_code = ? WHERE id = ?");
    $stmt->bind_param("si", $receiptCode, $receiptId);
    $stmt->execute();
    $stmt->close();

    // 7. Update order status to completed
    $stmt = $this->con->prepare("UPDATE userorder SET status = 'completed', updated_at = ? WHERE id = ?");
    $stmt->bind_param("si", $now, $orderId);
    $stmt->execute();
    $stmt->close();

    // 8. Deduct inventory
    $this->deductItemQuantities($orderId);

  
    $stmt = $this->con->prepare("DELETE FROM cart_item WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        error_log("❌ Failed to clear cart_item for user $userId: " . $stmt->error);
    }
    $stmt->close();


    return [
        'success' => true,
        'orderId' => $orderId,
        'receiptId' => $receiptId,
        'receiptCode' => $receiptCode
    ];
}
    private function deductItemQuantities($orderId) {
    // 1) Fetch ordered items
    $oiStmt = $this->con->prepare(
        "SELECT item_id, size_id, quantity FROM order_item WHERE order_id = ?"
    );
    $oiStmt->bind_param("i", $orderId);
    $oiStmt->execute();
    $oiRes = $oiStmt->get_result();

    // 2) Prepare statements
    $readyStockStmt = $this->con->prepare(
        "SELECT quantity FROM ready_item_stock WHERE item_id = ? AND size_id = ?"
    );
    $updateReadyStockStmt = $this->con->prepare(
        "UPDATE ready_item_stock SET quantity = GREATEST(quantity - ?, 0) WHERE item_id = ? AND size_id = ?"
    );
    $deleteReadyStockStmt = $this->con->prepare(
        "DELETE FROM ready_item_stock WHERE item_id = ? AND size_id = ? AND quantity = 0"
    );
    $recipeStmt = $this->con->prepare(
        "SELECT ingredient_id, quantity_value FROM item_ingredient WHERE item_id = ?"
    );
    $updateIngredientStmt = $this->con->prepare(
        "UPDATE ingredient SET quantity_in_stock = GREATEST(quantity_in_stock - ?, 0) WHERE id = ?"
    );

    while ($row = $oiRes->fetch_assoc()) {
        $itemId = (int)$row['item_id'];
        $sizeId = (int)$row['size_id'];
        $qty    = (int)$row['quantity'];

        // 3) Check ready stock
        $readyStockStmt->bind_param("ii", $itemId, $sizeId);
        $readyStockStmt->execute();
        $stockRes = $readyStockStmt->get_result()->fetch_assoc();
        $availableStock = $stockRes['quantity'] ?? 0;

        if ($availableStock >= $qty) {
            // Fully covered by ready stock
            $updateReadyStockStmt->bind_param("iii", $qty, $itemId, $sizeId);
            $updateReadyStockStmt->execute();
            $remainingQty = 0;
        } else {
            // Partially covered or none
            if ($availableStock > 0) {
                $updateReadyStockStmt->bind_param("iii", $availableStock, $itemId, $sizeId);
                $updateReadyStockStmt->execute();
            }
            $remainingQty = $qty - $availableStock;
        }

        // 4) Delete ready stock row if quantity is now 0
        $deleteReadyStockStmt->bind_param("ii", $itemId, $sizeId);
        $deleteReadyStockStmt->execute();

        // 5) Deduct remaining from ingredients if needed
        if ($remainingQty > 0) {
            $recipeStmt->bind_param("i", $itemId);
            $recipeStmt->execute();
            $rRes = $recipeStmt->get_result();

            while ($r = $rRes->fetch_assoc()) {
                $ingredientId = (int)$r['ingredient_id'];
                $perItemUse   = (float)$r['quantity_value'];
                $toDeduct     = $perItemUse * $remainingQty;

                $updateIngredientStmt->bind_param("di", $toDeduct, $ingredientId);
                $updateIngredientStmt->execute();
            }
        }
    }

    // Cleanup
    $oiStmt->close();
    $readyStockStmt->close();
    $updateReadyStockStmt->close();
    $deleteReadyStockStmt->close();
    $recipeStmt->close();
    $updateIngredientStmt->close();
}


}
?>
