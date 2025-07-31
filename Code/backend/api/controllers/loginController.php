<?php
ob_clean();
session_start(); // ✅ ADD THIS
header('Content-Type: application/json');

require_once dirname(__DIR__, 2) . '/model/auth.php';

function handleLogin($con) {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Missing email or password"]);
        return;
    }

    $auth = new Auth($con);
    $result = $auth->verifyCredentials($email, $password);

    if ($result) {
        // ✅ Set session so login is remembered
        $_SESSION['user_id'] = $result['account_id'];
        $_SESSION['account_type'] = $result['account_type'];

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "account_type" => $result['account_type'],
            "account_id" => $result['account_id']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    }
}
