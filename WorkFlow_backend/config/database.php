<?php
// Database configuration
class Database {
    // HOSTINGER PRODUCTION CREDENTIALS
    private $host = 'localhost';
    private $db_name = 'u177524058_vikrin_project';
    private $username = 'u177524058_ProjectManage';
    private $password = 'Vikrin@48';
    
    // FOR LOCAL DEVELOPMENT, use these instead:
    // private $host = 'localhost';
    // private $db_name = 'workflow_management';
    // private $username = 'root';
    // private $password = '';
    private $conn;

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }

        return $this->conn;
    }
}
?>
