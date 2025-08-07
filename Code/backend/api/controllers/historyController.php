<?php
header('Content-Type: application/json');
require_once dirname(__DIR__, 3) . '/database/db2.php';

session_start();

// ✅ 1. Check for login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit;
}

$userId = $_SESSION['user_id'];

// ✅ 2. Get user order history
$sql = "
    SELECT r.order_id, r.issued_at AS date, r.final_amount AS total
    FROM receipt r
    JOIN userorder u ON r.order_id = u.id
    WHERE u.user_id = ?
    ORDER BY r.issued_at DESC
";

$stmt = $con->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Failed to prepare history query."]);
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$history = [];

while ($row = $result->fetch_assoc()) {
    $orderId = $row['order_id'];

    // ✅ 3. Fetch items for each order
    $itemSql = "
        SELECT i.name, oi.quantity, oi.unit_price
        FROM order_item oi
        JOIN starbucksitem i ON oi.item_id = i.id
        WHERE oi.order_id = ?
    ";

    $stmtItems = $con->prepare($itemSql);
    if (!$stmtItems) {
        continue; // Skip if there's an issue
    }

    $stmtItems->bind_param("i", $orderId);
    $stmtItems->execute();
    $itemsResult = $stmtItems->get_result();

    $itemsList = [];
    while ($item = $itemsResult->fetch_assoc()) {
        $itemName = htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8');
        $itemQty = (int)$item['quantity'];
        $itemPrice = number_format((float)$item['unit_price'], 2);
        $itemsList[] = "{$itemName} x{$itemQty} - ₱{$itemPrice}";
    }

    $history[] = [
        "id" => $orderId,
        "date" => $row['date'],
        "total" => number_format($row['total'], 2),
        "items" => implode("\n", $itemsList) // use real line breaks for frontend
    ];
}

// ✅ 4. Return result as JSON
echo json_encode([
    "status" => true,
    "history" => $history
]);
