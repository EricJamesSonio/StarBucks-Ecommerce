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
}
?>
