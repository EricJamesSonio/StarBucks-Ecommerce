<?php
require_once(__DIR__ . '/db2.php');
require_once(__DIR__ . '/scripts/function.php');

// --- MODEL CREATION (unchanged) ---
require_once(__DIR__ . '/model/category.php');
require_once(__DIR__ . '/model/subcategory.php');
require_once(__DIR__ . '/model/starbucksitem.php');
require_once(__DIR__ . '/model/attributes_templates.php');
require_once(__DIR__ . '/model/itemattributes.php');
require_once(__DIR__ . '/model/contacts.php');
require_once(__DIR__ . '/model/users.php');
require_once(__DIR__ . '/model/admins.php');
require_once(__DIR__ . '/model/auth.php');
require_once(__DIR__ . '/model/user_order.php');
require_once(__DIR__ . '/model/size.php');      // also creates item_size
require_once(__DIR__ . '/model/orderitems.php');
require_once(__DIR__ . '/model/receipts.php');
require_once(__DIR__ . '/model/cart_items.php');
require_once(__DIR__ . '/model/discount.php');
require_once(__DIR__ . '/model/country.php');
require_once(__DIR__ . '/model/province.php');
require_once(__DIR__ . '/model/city.php');
require_once(__DIR__ . '/model/address.php');
require_once(__DIR__ . '/model/inventory_setting.php');

// --- DATA SEEDING ---
// 1) core lookups & static data
require_once(__DIR__ . '/scripts/data/category_data.php');
require_once(__DIR__ . '/scripts/data/subcategory_data.php');
require_once(__DIR__ . '/scripts/data/attributes_templates_data.php');
require_once(__DIR__ . '/scripts/data/starbucksitem.php');
require_once(__DIR__ . '/scripts/data/item_attributes_data.php');
require_once(__DIR__ . '/scripts/data/users.php');
require_once(__DIR__ . '/scripts/data/admins.php');
require_once(__DIR__ . '/scripts/data/contacts.php');
require_once(__DIR__ . '/scripts/data/auth.php');
require_once(__DIR__ . '/scripts/data/address.php');
require_once(__DIR__ . '/scripts/data/discounts.php');
require_once(__DIR__ . '/scripts/data/inventory_setting.php');

// 2) seed sizes lookup  
require_once(__DIR__ . '/scripts/data/size.php');

// 3) map each drink → all sizes  
require_once(__DIR__ . '/scripts/data/item_size.php');

// 4) seed some orders so order_item has something to reference  
require_once(__DIR__ . '/scripts/data/sample_order.php');

// 5) now seed order_items (drinks will get valid size_ids)  
require_once(__DIR__ . '/scripts/data/order_item.php');

// (optionally) 6) seed receipts, etc.
// require_once(__DIR__ . '/scripts/data/receipts_data.php');

echo "✅ All tables created and seeded successfully.";