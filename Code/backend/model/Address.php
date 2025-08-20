<?php
class Address {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

public function createAddress($type, $id, $street, $country_id, $province_id, $city_id) {
    error_log("createAddress called with: type=$type, id=$id, street=$street, country_id=$country_id, province_id=$province_id, city_id=$city_id");

    $stmt = $this->con->prepare("
        INSERT INTO address (
          addressable_type,
          addressable_id,
          street,
          country_id,
          province_id,
          city_id
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("sisiii", $type, $id, $street, $country_id, $province_id, $city_id);
    return $stmt->execute();
}



    }
