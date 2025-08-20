<?php
// backend/api/controllers/inventoryController.php

require_once dirname(__DIR__, 2) . '/model/InventorySetting.php';

class InventoryController {
    private $model;

    public function __construct($dbConnection) {
        $this->model = new InventorySetting($dbConnection);
        header('Content-Type: application/json');
    }

    // GET: return current global threshold
    public function getInventorySetting() {
        $threshold = $this->model->getGlobalThreshold();
        echo json_encode(['status' => true, 'data' => ['global_threshold' => $threshold]]);
    }

    // POST/PUT: set/update global threshold
    public function upsertInventorySetting() {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if (!$data || !isset($data['global_threshold'])) {
            http_response_code(400);
            echo json_encode(['status' => false, 'message' => 'Missing global_threshold']);
            return;
        }

        $threshold = intval($data['global_threshold']);
        $updated_by = isset($data['updated_by']) ? intval($data['updated_by']) : null;

        $res = $this->model->upsertGlobalThreshold($threshold, $updated_by);

        if ($res['success']) {
            echo json_encode([
                'status' => true,
                'data' => ['id' => $res['id'], 'global_threshold' => $threshold]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['status' => false, 'error' => $res['error']]);
        }
    }

    // GET action=low-stock : list low stock items using the global threshold
    public function getLowStockItems() {
        $items = $this->model->getLowStockItems();
        echo json_encode(['status' => true, 'data' => $items]);
    }
}

/*
    ================================
    To keep backward compatibility with function calls in other files:
    ================================
*/
function getInventorySetting($con) {
    $controller = new InventoryController($con);
    $controller->getInventorySetting();
}

function upsertInventorySetting($con) {
    $controller = new InventoryController($con);
    $controller->upsertInventorySetting();
}

function getLowStockItems($con) {
    $controller = new InventoryController($con);
    $controller->getLowStockItems();
}
