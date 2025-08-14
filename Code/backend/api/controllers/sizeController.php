<?php
// backend/api/controllers/sizeController.php

require_once dirname(__DIR__, 2) . '/model/Size.php';
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

class SizeController {
    private $con;
    private $sizeModel;

    public function __construct($dbConnection) {
        $this->con = $dbConnection;
        $this->sizeModel = new Size($this->con);
    }

    public function getSizes() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['message' => 'Method Not Allowed']);
            return;
        }

        $sizes = $this->sizeModel->getAll();
        echo json_encode($sizes);
    }
}

function handleSize($con) {
    $controller = new SizeController($con);
    $controller->getSizes();
}
