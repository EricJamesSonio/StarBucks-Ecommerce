<?php

class TopSelling {
    private $conn;

    public function __construct($con) {
        $this->conn = $con;
    }

    public function fetchTopSellingItems() {
        $sql = "
            SELECT 
                si.id,
                si.name,
                si.price,
                si.category_id,
                si.image_url,              -- ✅ include image
                SUM(oi.quantity) AS total_sold
            FROM order_item oi
            JOIN starbucksitem si ON oi.item_id = si.id
            GROUP BY si.id, si.name, si.price, si.category_id, si.image_url
            ORDER BY total_sold DESC
            LIMIT 10
        ";

        $result = $this->conn->query($sql);
        $items = [];

        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }

        return $items;
    }
}
