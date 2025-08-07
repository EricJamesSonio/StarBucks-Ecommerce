******************************* BACKEND SUMMARY **********************************

[Backend Flow]

[API FLOW]

index.php --> checks URL type . ex. ("/items")
--> require = [routes/items.php] -- calls the items.php from [routes] folder
--> items.php uses the [controllers/itemcontroller.php] for response
--> [controllers/itemcontroller.php] uses [model/Item.php] logic functions business and database

[Folders]

-------------- Models and Controller connection --------------
[models]        --> Interact with DATABASE "Functions" ex. SELECT * FROM etc.
[controllers]   --> Checking Request Method "GET/POST/PUT/PATCH" and Validation before calls [models] functions

-------------- routes and index.php connection --------------
index.php       --> Main API checks the request ex. ("/items", "/suppliers")
                --> each request has equivalent routes
                --> ex. "/items" = [routes] -- items.php

[routes]        -->  use controller to respond from the request 
                --> index.php calls the files inside to respond


