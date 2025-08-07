<?php
// backend/api/routes/sizes.php

// $con is already set by index.php (db.php was required there)
require_once __DIR__ . '/../controllers/sizeController.php';

// Dispatch to the controller
handleSize($con);
