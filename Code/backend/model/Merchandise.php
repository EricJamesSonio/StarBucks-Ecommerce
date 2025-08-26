<?php

class Merchandise {
    private $con;

    public function __construct($connection) {
        $this->con = $connection;
    }

    public function getFilteredMerchandise($subcategory_id = 0) {
        $sql = "SELECT m.id, m.name, m.price, m.description, m.image_url, 
                       c.name as category_name, s.name as subcategory_name,
                       m.category_id, m.subcategory_id
                FROM merchandise m
                LEFT JOIN category c ON m.category_id = c.id
                LEFT JOIN subcategory s ON m.subcategory_id = s.id";
        
        $params = [];
        $types = "";
        
        if ($subcategory_id > 0) {
            $sql .= " WHERE m.subcategory_id = ?";
            $params[] = $subcategory_id;
            $types .= "i";
        }
        
        $sql .= " ORDER BY m.name ASC";
        
        $stmt = $this->con->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
