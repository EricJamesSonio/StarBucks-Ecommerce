<?php
// backend/api/controllers/inventoryController.php

require_once dirname(__DIR__, 2) . '/model/InventorySetting.php';

// GET: return current global threshold
function getInventorySetting($con) {
    $model = new InventorySetting($con);
    $threshold = $model->getGlobalThreshold();
    header('Content-Type: application/json');
    echo json_encode(['status' => true, 'data' => ['global_threshold' => $threshold]]);
}

// POST/PUT: set/update global threshold (body JSON: { "global_threshold": 5, "updated_by": 1 })
function upsertInventorySetting($con) {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    if (!$data || !isset($data['global_threshold'])) {
        http_response_code(400);
        echo json_encode(['status' => false, 'message' => 'Missing global_threshold']);
        return;
    }

    $threshold = intval($data['global_threshold']);
    $updated_by = isset($data['updated_by']) ? intval($data['updated_by']) : null;

    $model = new InventorySetting($con);
    $res = $model->upsertGlobalThreshold($threshold, $updated_by);
    header('Content-Type: application/json');
    if ($res['success']) {
        echo json_encode(['status' => true, 'data' => ['id' => $res['id'], 'global_threshold' => $threshold]]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => false, 'error' => $res['error']]);
    }
}

// GET action=low-stock : list low stock items using the global threshold
function getLowStockItems($con) {
    $model = new InventorySetting($con);
    $items = $model->getLowStockItems();
    header('Content-Type: application/json');
    echo json_encode(['status' => true, 'data' => $items]);
}
