<?php
class Payment {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function saveReceipt($type, $paid, $total, $discount, $final) {
    session_start();
    $now = date('Y-m-d H:i:s');

    // 1. Get current user (required for orders)
    if (!isset($_SESSION['user_id'])) {
        return ['success' => false, 'error' => 'User not logged in.'];
    }

    $userId = $_SESSION['user_id'];
    require_once dirname(__DIR__) . '/model/cart.php'; // Adjust path as needed
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
    $orderId = $stmt->insert_id;
    $stmt->close();

    // 3. Insert order items
    foreach ($cart as $item) {
    $itemId = $item['item_id'] ?? $item['id'];  // safer
    $qty = $item['quantity'];
    $unitPrice = $item['unitPrice'] ?? $item['price'];  // fallback if unitPrice doesn't exist

        $stmt = $this->con->prepare("INSERT INTO order_item (order_id, item_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiid", $orderId, $itemId, $qty, $unitPrice);
        if (!$stmt->execute()) {
            return ['success' => false, 'error' => 'Failed to insert order item.'];
        }
        $stmt->close();
    }

    // 4. Calculate values
    $discountAmount = $total - $final;
    $change = $paid - $final;

    // 5. Insert receipt
    $stmt = $this->con->prepare("INSERT INTO receipt (
        order_id, discount_type, discount_value, discount_amount,
        final_amount, payment_amount, change_amount, issued_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        return ['success' => false, 'error' => 'Failed to prepare receipt insert'];
    }

    $stmt->bind_param("isddddds", $orderId, $type, $discount, $discountAmount, $final, $paid, $change, $now);

    if (!$stmt->execute()) {
        return ['success' => false, 'error' => 'Failed to insert receipt'];
    }

    $receiptId = $stmt->insert_id;
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

    // 9. Clear cart_items for this user
    $stmt = $this->con->prepare("DELETE FROM cart_items WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        error_log("❌ Failed to clear cart_items for user $userId: " . $stmt->error);
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
    $query = "
        SELECT item_id, quantity
        FROM order_item
        WHERE order_id = ?
    ";
    $stmt = $this->con->prepare($query);
    $stmt->bind_param("i", $orderId);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $itemId = $row['item_id'];
        $qty = $row['quantity'];

        $update = $this->con->prepare("
            UPDATE starbucksitem
            SET quantity = quantity - ?
            WHERE id = ?
        ");

        if (!$update) {
            error_log("❌ Failed to prepare update for item ID $itemId: " . $this->con->error);
            continue;
        }

        $update->bind_param("ii", $qty, $itemId);
        if (!$update->execute()) {
            error_log("❌ Failed to deduct $qty from item ID $itemId: " . $update->error);
        } else {
            error_log("✅ Deducted $qty from item ID $itemId");
        }
    }
}


}
?>
