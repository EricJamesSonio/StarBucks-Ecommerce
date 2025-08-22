<?php
require_once(__DIR__ . '/../function.php');

$adminId = getIdByFullName($con, 'admin', 'Eric James', 'Sonio');

insertData(
    $con,
    'auth',
    ['account_type', 'account_id', 'email', 'password_hash'],
    [
        ['admin', $adminId, 'admin1@example.com', password_hash('adminpass123', PASSWORD_DEFAULT)]
    ],
    ['email'] // ✅ Only insert if email is not already used
);
