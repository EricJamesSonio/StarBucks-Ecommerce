<?php
// backend/api/controllers/sizeController.php

require_once dirname(__DIR__, 2) . '/model/Size.php';
header('Content-Type: application/json');

// Turn on errors while you’re testing
ini_set('display_errors', 1);
error_reporting(E_ALL);

/**
 * GET /sizes
 */
function handleSize($con) {
    // Only allow GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['message' => 'Method Not Allowed']);
        return;
    }

    // Use your Size model
    $sizeModel = new Size($con);
    $sizes     = $sizeModel->getAll();

    echo json_encode($sizes);
}
