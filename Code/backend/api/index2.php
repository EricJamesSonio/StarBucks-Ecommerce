<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
ini_set('html_errors', 0);
header('Content-Type: application/json');
// … the rest of your code …

//ini_set('display_errors', 0); // or 1 if you want to debug
//ini_set('html_errors', 0);    // ❗ important: prevents HTML in error


require_once dirname(__DIR__, 2) . '/database/db2.php';

header("Access-Control-Allow-Origin: http://localhost");
header("Access-Control-Allow-Credentials: true");

header("Content-Type: application/json");

// Get and parse the request path
$request = $_SERVER['REQUEST_URI'];
$uri = parse_url($request, PHP_URL_PATH);
$uri = explode('/', trim($uri, '/'));

$uri = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$index = array_search('api', $uri);  // find where 'api' is in the path
$route = isset($uri[$index + 1]) ? $uri[$index + 1] : '';



switch ($route) {
    case 'items':
        require __DIR__ . '/routes/items.php';
        break;

    case 'checkout':
        require __DIR__ . '/routes/checkout.php';
        break;

    case 'payment':
        require __DIR__ . '/routes/payment.php';
        break;

    case 'receipt':
        require __DIR__ . '/routes/receipt.php';
        break;

    case 'sizes':                  
        require __DIR__ . '/routes/sizes.php';
        break;

    case 'login':
        require __DIR__ . '/routes/login.php';
        break;

    case 'signup':
        require __DIR__ . '/routes/signup.php';
        break;

    case 'check_login':
        require __DIR__ . '/routes/check_login.php';
        break;

    case 'logout':
        require __DIR__ . '/routes/logout.php';
        break;

    case 'history':
        require_once __DIR__ . '/routes/history.php';
        break;

    case 'cart':
        require_once __DIR__ . '/routes/cart.php';
        break;

    case 'topselling':
        require_once __DIR__ . '/routes/topselling.php';
        break;

    case 'guest':
        require_once __DIR__ . '/routes/guest.php';
        break;

    case 'getCities':
        require_once __DIR__ . '/routes/getCities.php';
        break;

    case 'getCountries':
        require_once __DIR__ . '/routes/getCountries.php';
        break;

    case 'getProvince':
        require_once __DIR__ . '/routes/getProvince.php';
        break;

    case 'subcategories':
        require __DIR__ . '/routes/subcategories.php';
        break;

    case 'inventory':
        require __DIR__ . '/routes/inventory.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Route not found"]);
        break;
}