<?php
require_once(__DIR__ . '/../function.php');

insertData($con, 'inventory_settings', ['global_threshold', 'updated_by'], [
    [10, null]
]);
?>
