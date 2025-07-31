<?php
require_once(__DIR__ . '/../function.php');

$addresses = [];

// User address
$userId = getIdByFullName($con, 'user', 'Juan', 'Cruz');
if ($userId) {
    $addresses[] = ['user', $userId, '123 Mango St', 'Makati', 'Metro Manila', '1226', 'Philippines'];
}

// Admin address
$adminId = getIdByFullName($con, 'admin', 'Maria', 'Santos');
if ($adminId) {
    $addresses[] = ['admin', $adminId, '456 Admin Ave', 'Pasig', 'Metro Manila', '1600', 'Philippines'];
}

// Insert all
insertData($con, 'address',
    ['addressable_type', 'addressable_id', 'street', 'city', 'province', 'postal_code', 'country'],
    $addresses,
    ['addressable_type', 'addressable_id'] // Unique constraint for duplicate checking
);
