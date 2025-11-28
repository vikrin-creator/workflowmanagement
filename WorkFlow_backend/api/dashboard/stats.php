<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    include_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    // Get dashboard statistics
    $stats = [];

    // Get confirmed, not confirmed, and lost client counts
    $query = "SELECT 
              COUNT(CASE WHEN is_confirmed = 1 AND is_lost = 0 THEN 1 END) as confirmed,
              COUNT(CASE WHEN is_confirmed = 0 AND is_lost = 0 THEN 1 END) as not_confirmed,
              COUNT(CASE WHEN is_lost = 1 THEN 1 END) as lost
              FROM clients";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $clientStats = $stmt->fetch();

    $stats['clients'] = [
        'confirmed' => (int)$clientStats['confirmed'],
        'notConfirmed' => (int)$clientStats['not_confirmed'],
        'lost' => (int)$clientStats['lost']
    ];

    // Get project status counts
    $query = "SELECT status, COUNT(*) as count FROM projects GROUP BY status";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $projectStats = $stmt->fetchAll();

    $stats['projects'] = [
        'in_progress' => 0,
        'waiting_for_client' => 0,
        'completed' => 0
    ];

    foreach ($projectStats as $stat) {
        if ($stat['status'] === 'in-progress') {
            $stats['projects']['in_progress'] = (int)$stat['count'];
        } elseif ($stat['status'] === 'waiting-for-client-response') {
            $stats['projects']['waiting_for_client'] = (int)$stat['count'];
        } elseif ($stat['status'] === 'completed') {
            $stats['projects']['completed'] = (int)$stat['count'];
        }
    }

    http_response_code(200);
    echo json_encode(['success' => true, 'data' => $stats]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
