<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../controllers/salesReportController.php';

$salesController = new SalesReportController($con);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $startDate = $_GET['start'] ?? null;
    $endDate   = $_GET['end'] ?? null;

    echo json_encode($salesController->getSalesReport($startDate, $endDate));
    exit;
}

http_response_code(405);
echo json_encode(["status" => false, "message" => "Method not allowed"]);
