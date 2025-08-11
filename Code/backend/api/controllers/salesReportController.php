<?php
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
header('Content-Type: application/json; charset=utf-8');

class SalesReportController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getSalesReport($startDate = null, $endDate = null) {
        $conditions = "";
        $types = "";
        $params = [];

        if ($startDate && $endDate) {
            $conditions = "WHERE uo.placed_at BETWEEN ? AND ?";
            $types = "ss";
            $params[] = $startDate . " 00:00:00";
            $params[] = $endDate . " 23:59:59";
        }

        // ===== Total Sales =====
        $sqlTotal = "SELECT SUM(final_amount) as total_sales
                     FROM receipt r
                     JOIN userorder uo ON uo.id = r.order_id
                     $conditions";
        $stmt = $this->db->prepare($sqlTotal);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $totalSales = $result->fetch_assoc()['total_sales'] ?? 0;
        $stmt->close();

        // ===== Total Orders =====
        $sqlOrders = "SELECT COUNT(*) as total_orders
                      FROM userorder uo
                      $conditions";
        $stmt = $this->db->prepare($sqlOrders);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $totalOrders = $result->fetch_assoc()['total_orders'] ?? 0;
        $stmt->close();

        // ===== Top Selling Items (only from paid orders) =====
        $sqlTop = "SELECT si.name, SUM(oi.quantity) as total_sold
                   FROM order_item oi
                   JOIN starbucksitem si ON si.id = oi.item_id
                   JOIN userorder uo ON uo.id = oi.order_id
                   JOIN receipt r ON r.order_id = uo.id
                   $conditions
                   GROUP BY si.id
                   ORDER BY total_sold DESC
                   LIMIT 10";
        $stmt = $this->db->prepare($sqlTop);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $topSelling = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return [
            "status" => true,
            "total_sales" => floatval($totalSales),
            "total_orders" => $totalOrders,
            "top_selling" => $topSelling
        ];
    }
}
