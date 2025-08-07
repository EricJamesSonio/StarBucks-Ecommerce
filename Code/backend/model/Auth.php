<?php
class Auth {
    private $con;

    public function __construct($con) {
        $this->con = $con;
    }

    /**
     * Check email + password against the auth table.
     * Returns ['account_type'=>…, 'account_id'=>…] on success, or false on failure.
     */
    public function verifyCredentials($email, $password) {
        $stmt = $this->con->prepare("
            SELECT account_type, account_id, password_hash
              FROM auth
             WHERE email = ?
        ");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $auth = $stmt->get_result()->fetch_assoc();

        if ($auth && password_verify($password, $auth['password_hash'])) {
            return [
                'account_type' => $auth['account_type'],
                'account_id'   => $auth['account_id']
            ];
        }

        return false;
    }

    /**
     * Insert a new auth record for sign-up.
     * Returns true on success, false on failure.
     */
    public function createAuth($accountType, $accountId, $email, $password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->con->prepare("
            INSERT INTO auth (
              account_type,
              account_id,
              email,
              password_hash
            ) VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param("siss", $accountType, $accountId, $email, $hash);
        return $stmt->execute();
    }
}