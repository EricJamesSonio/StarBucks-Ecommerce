<?php
// backend/model/InventorySetting.php
// Model to manage the single global inventory threshold

require_once dirname(__DIR__, 2) . '/database/db2.php';

class InventorySetting {
    private $conn;

    public function __construct($con) {
        $this->conn = $con;
    }

    // Return the single global threshold (0 if none set)
    public function getGlobalThreshold() {
        $sql = "SELECT global_threshold FROM inventory_settings ORDER BY id DESC LIMIT 1";
        $res = $this->conn->query($sql);
        if ($res && $row = $res->fetch_assoc()) {
            return intval($row['global_threshold']);
        }
        return 0;
    }

    // Upsert the global threshold (set/update). Returns inserted/updated id or error
    public function upsertGlobalThreshold($threshold, $updated_by = null) {
        $threshold = intval($threshold);
        if ($threshold < 0) {
            return ['success' => false, 'error' => 'Threshold must be >= 0'];
        }

        // See if a row exists
        $sqlCheck = "SELECT id FROM inventory_settings ORDER BY id DESC LIMIT 1";
        $res = $this->conn->query($sqlCheck);
        if ($res && $row = $res->fetch_assoc()) {
            $id = intval($row['id']);
            $sql = "UPDATE inventory_settings SET global_threshold = ?, updated_by = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("isi", $threshold, $updated_by, $id);
            if ($stmt->execute()) return ['success' => true, 'id' => $id];
            return ['success' => false, 'error' => $stmt->error];
        } else {
            $sql = "INSERT INTO inventory_settings (global_threshold, updated_by) VALUES (?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("is", $threshold, $updated_by);
            if ($stmt->execute()) return ['success' => true, 'id' => $stmt->insert_id];
            return ['success' => false, 'error' => $stmt->error];
        }
    }

    // Return items that are low stock relative to the global threshold
    public function getLowStockItems() {
        $threshold = $this->getGlobalThreshold();
        if ($threshold <= 0) return []; // no threshold set -> empty list

        $sql = "SELECT id, name, price, quantity, category_id
                FROM starbucksitem
                WHERE quantity <= ?
                ORDER BY quantity ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $threshold);
        $stmt->execute();
        $res = $stmt->get_result();
        $items = [];
        while ($r = $res->fetch_assoc()) $items[] = $r;
        return $items;
    }
}
