<?php
require_once dirname(__DIR__, 2) . '/database/db2.php';


class Item {
    private $conn;

    public function __construct($con) {
        $this->conn = $con;
    }

    public function getAllItems() {
        $sql = "SELECT * FROM starbucksitem";
        $result = $this->conn->query($sql);

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        return $items;
    }

    public function getFilteredItems($category_id = 0, $subcategory_id = 0) {
        $sql = "SELECT * FROM starbucksitem WHERE 1=1";
        $types = "";
        $params = [];

        if ($category_id) {
            $sql .= " AND category_id = ?";
            $types .= "i";
            $params[] = $category_id;
        }

        if ($subcategory_id) {
            $sql .= " AND subcategory_id = ?";
            $types .= "i";
            $params[] = $subcategory_id;
        }

        $stmt = $this->conn->prepare($sql);

        if ($params) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        return $items;
    }
}
?>
