<?php
ob_clean();
session_start(); // ✅ ADD THIS
header('Content-Type: application/json');

require_once dirname(__DIR__, 2) . '/model/Auth.php';

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
        // Transfer guest cart to database
if (!empty($_SESSION['guest_token'])) {
    require_once dirname(__DIR__, 2) . '/model/Cart.php';
    require_once dirname(__DIR__, 3) . '/database/db2.php';

    $guestToken = $_SESSION['guest_token'];
    $userId = $result['account_id'];

    // Migrate guest cart to user
    $stmt = $con->prepare("
        UPDATE cart_item
        SET user_id = ?, guest_token = NULL
        WHERE guest_token = ?
    ");
    $stmt->bind_param("is", $userId, $guestToken);
    $stmt->execute();
    $stmt->close();

    unset($_SESSION['guest_token']);
}


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
