<?php
class Cart {
    private $con;

    public function __construct(mysqli $con) {
        $this->con = $con;
    }

    public function getCartItems(int $userId): array {
        $sql = "
            SELECT
              ci.id           AS cart_item_id,
              si.id           AS item_id,
              si.name,
              si.price,
              ci.quantity,
              ci.size_id,
              sz.name        AS size_name
            FROM cart_items ci
            JOIN starbucksitem si ON ci.item_id = si.id
            LEFT JOIN size sz ON ci.size_id = sz.id
            WHERE ci.user_id = ?
        ";
        $stmt = $this->con->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $this->con->error);
        }

        $stmt->bind_param("i", $userId);
        $stmt->execute();

        $res = $stmt->get_result();
        $rows = $res->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        return $rows;
    }

    public function addOrUpdateCartItem(int $userId, int $itemId, ?int $sizeId, int $quantity): bool {
        // Check if cart item exists for same user + item + size
        $check = $this->con->prepare(
            "SELECT id FROM cart_items WHERE user_id = ? AND item_id = ? AND (size_id <=> ?)"
        );
        $check->bind_param("iii", $userId, $itemId, $sizeId);
        $check->execute();
        $exists = $check->get_result()->fetch_assoc();
        $check->close();

        if ($exists) {
            $upd = $this->con->prepare(
                "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND item_id = ? AND (size_id <=> ?)"
            );
            $upd->bind_param("iiii", $quantity, $userId, $itemId, $sizeId);
            $ok = $upd->execute();
            $upd->close();
            return $ok;
        } else {
            $ins = $this->con->prepare(
                "INSERT INTO cart_items (user_id, item_id, size_id, quantity) VALUES (?, ?, ?, ?)"
            );
            $ins->bind_param("iiii", $userId, $itemId, $sizeId, $quantity);
            $ok = $ins->execute();
            $ins->close();
            return $ok;
        }
    }

    public function removeCartItem(int $userId, int $itemId, ?int $sizeId): bool {
        $stmt = $this->con->prepare(
            "DELETE FROM cart_items WHERE user_id = ? AND item_id = ? AND (size_id <=> ?)"
        );
        $stmt->bind_param("iii", $userId, $itemId, $sizeId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    public function clearCart(int $userId): bool {
        $stmt = $this->con->prepare(
            "DELETE FROM cart_items WHERE user_id = ?"
        );
        $stmt->bind_param("i", $userId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }
}
?>
