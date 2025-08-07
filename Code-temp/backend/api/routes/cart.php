<?php
require_once __DIR__ . '/../controllers/cartController.php';
require_once dirname(__DIR__, 3) . '/database/db2.php';

handleCart($con);
