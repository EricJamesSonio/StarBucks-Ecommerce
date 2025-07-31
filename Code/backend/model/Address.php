<?php
class Address {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    public function createAddress($type, $id, $street, $city, $province, $postal, $country) {
        $stmt = $this->con->prepare("
            INSERT INTO address (
              addressable_type,
              addressable_id,
              street,
              city,
              province,
              postal_code,
              country
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("sisssss", $type, $id, $street, $city, $province, $postal, $country);
        return $stmt->execute();
    }
}