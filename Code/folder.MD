SOFTENG2/
├── backend/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── itemController.php
│   │   │   ├── checkoutController.php
│   │   │   ├── loginController.php
│   │   │   ├── paymentController.php
│   │   │   ├── signupController.php
│   │   │   └── sizeController.php
|   |   |   └── historyController.php
│   │   │
│   │   ├── routes/
│   │   │   ├── items.php
│   │   │   ├── check_login.php
│   │   │   ├── checkout.php
│   │   │   ├── login.php
│   │   │   ├── orders.php
│   │   │   ├── payment.php
│   │   │   ├── receipt.php
│   │   │   ├── signup.php
│   │   │   └── sizes.php
|   |   |   └── history.php
│   │   │
│   │   ├── tcpdf/                # Library for PDF receipts
│   │   └── index.php             # Entry point of backend API
│   │
│   └── model/
│       ├── Address.php
│       ├── Auth.php
│       ├── Contact.php
│       ├── Item.php
│       ├── Order.php
│       ├── Payment.php
│       ├── Size.php
│       └── User.php
│
├── database/
│   ├── model/
│   │   ├── address.php
│   │   ├── admins.php
│   │   ├── attributes_template.php
│   │   ├── auth.php
│   │   ├── category.php
│   │   ├── contacts.php
│   │   ├── itemattributes.php
│   │   ├── orderitems.php
│   │   ├── receipts.php
│   │   ├── size.php
│   │   ├── starbucksitem.php
│   │   ├── subcategoryitems.php
│   │   ├── user_order.php
│   │   └── users.php
│   │
│   ├── scripts/
│   │   └── data/                 # Contains actual data to inject
│   │
│   ├── db2.php                   # Database configuration (&con)
│   └── seed.php                  # Script for seeding database
│
├── frontend/
│   ├── components/               # For login2.html
│   │   ├── signup-form.html
│   │   ├── login-form.html
│   │   ├── start-screen.html
│   │   └── errorMessage.html
│   │
│   ├── js/
│   │   ├── auth.js              # Handles signup/login backend interaction
│   │   ├── config.js            # Base URL config
│   │   
│   │   
|   |── css/
|   |   ├── history.css 
|   |   ├── menu2.css # Category display and items page
|   |   ├── login2.css # Styling for login2.html
|   |
|   |── menu/  -- use in menu2.html
|   |   ├── cart.js       
|   |   ├── category.js
|   |   ├── init.js
|   |   ├── modal.js
|   |   ├── payment.js
|   |   └── receipt.js
|   |   └── history.js
|   |
|   |
|   |
│   ├── images/                  # Contains images of items
│   ├── login2.html              # Login, signup, guest access page
|   └── history.html            # for displaying orders 
