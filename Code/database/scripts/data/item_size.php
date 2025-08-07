<?php
require_once(__DIR__ . '/../../db2.php');
require_once(__DIR__ . '/../function.php');

// Gather all size IDs
$sizeIds = [];
$res = mysqli_query($con, "SELECT id FROM size");
while ($r = mysqli_fetch_assoc($res)) {
    $sizeIds[] = $r['id'];
}

// Gather all drink-item IDs
$drinkItemIds = [];
$res = mysqli_query($con, "
  SELECT s.id
  FROM starbucksitem s
  JOIN category c ON s.category_id = c.id
  WHERE LOWER(c.name) = 'drink'
");
while ($r = mysqli_fetch_assoc($res)) {
    $drinkItemIds[] = $r['id'];
}

if (empty($sizeIds) || empty($drinkItemIds)) {
    echo "⚠️ Skipping item_size seeder—no sizes or no drinks exist yet.<br>";
    return;
}

// Link every drink to every size
$rows = [];
foreach ($drinkItemIds as $itemId) {
  foreach ($sizeIds    as $sizeId) {
    $rows[] = [$itemId, $sizeId];
  }
}

insertData($con, 'item_size', ['item_id','size_id'], $rows);
echo "✅ Inserted ".count($rows)." rows into item_size.<br>";
