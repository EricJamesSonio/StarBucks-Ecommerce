<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json'); // 👈 ensure always returns JSON

require_once dirname(__DIR__, 2) . '/model/User.php';
require_once dirname(__DIR__, 2) . '/model/Auth.php';
require_once dirname(__DIR__, 2) . '/model/Address.php';
require_once dirname(__DIR__, 2) . '/model/Contact.php';

function getIdByName($con, $table, $name) {
    $stmt = $con->prepare("SELECT id FROM $table WHERE name = ?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->bind_result($id);
    if ($stmt->fetch()) {
        $stmt->close();
        return $id;
    }
    $stmt->close();
    return null; // Not found
}

function handleSignup($con) {
    // Parse incoming JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid or empty JSON"]);
        return;
    }

    // Validate required fields
    $requiredFields = ['first_name', 'last_name', 'email', 'phone', 'password', 'street', 'city', 'province', 'postal_code', 'country'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing field: $field"]);
            return;
        }
    }

    // 1) Create user
    $userModel = new User($con);
    $userId = $userModel->createUser(
        $data['first_name'],
        $data['middle_name'] ?? '',
        $data['last_name']
    );

    if (!$userId) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create user"]);
        return;
    }

    // 2) Create auth
    $authModel = new Auth($con);
    $authCreated = $authModel->createAuth('user', $userId, $data['email'], $data['password']);

    if (!$authCreated) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create auth record"]);
        return;
    }
$addressModel = new Address($con);
    // 3) Save address
$country_id = getIdByName($con, 'country', $data['country']);
$province_id = getIdByName($con, 'province', $data['province']);
$city_id = getIdByName($con, 'city', $data['city']);

if (!$country_id || !$province_id || !$city_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid address data"]);
    return;
}

$addressCreated = $addressModel->createAddress(
    'user',
    $userId,
    $data['street'],
    $country_id,
    $province_id,
    $city_id
);


    if (!$addressCreated) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save address"]);
        return;
    }

    // 4) Save contacts
    $contactModel = new Contact($con);
    $emailContactOk = $contactModel->createContact('user', $userId, 'email', $data['email']);
    $phoneContactOk = $contactModel->createContact('user', $userId, 'phone', $data['phone']);

    if (!$emailContactOk || !$phoneContactOk) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save contact info"]);
        return;
    }

    // ✅ Success
    echo json_encode(["success" => true, "message" => "Sign up successful"]);
}
