<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing database connection...<br>";

include_once 'config/database.php';

echo "Database class included<br>";

$database = new Database();
echo "Database object created<br>";

$db = $database->getConnection();
echo "Connection obtained<br>";

if ($db) {
    echo "SUCCESS: Connected to database!<br>";
    
    // Test query
    $query = "SELECT COUNT(*) as total FROM clients";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();
    echo "Total clients: " . $result['total'];
} else {
    echo "FAILED: Could not connect to database";
}
?>
