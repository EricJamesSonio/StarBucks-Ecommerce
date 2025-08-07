<?php
class User {
  private $con;
  public function __construct($con) { $this->con = $con; }

  public function createUser($fn, $mn, $ln) {
    $stmt = $this->con->prepare("
      INSERT INTO user (first_name,middle_name,last_name)
      VALUES (?,?,?)
    ");
    $stmt->bind_param("sss", $fn, $mn, $ln);
    return $stmt->execute()
      ? $this->con->insert_id
      : false;
  }
}