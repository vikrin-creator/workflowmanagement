<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    include_once '../config/database.php';

    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Database connection failed");
    }

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get status updates for a project
        $projectId = isset($_GET['project_id']) ? $_GET['project_id'] : '';
        
        if (!empty($projectId)) {
            $query = "SELECT * FROM status_updates WHERE project_id = :project_id ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':project_id', $projectId);
            $stmt->execute();
            
            $updates = $stmt->fetchAll();
            
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $updates]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Project ID is required']);
        }
        break;

    case 'POST':
        // Add new status update
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->project_id) && !empty($data->update_text) && !empty($data->updated_by)) {
            $query = "INSERT INTO status_updates (project_id, progress, update_text, updated_by) 
                      VALUES (:project_id, :progress, :update_text, :updated_by)";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':project_id', $data->project_id);
            $stmt->bindParam(':progress', $data->progress);
            $stmt->bindParam(':update_text', $data->update_text);
            $stmt->bindParam(':updated_by', $data->updated_by);
            
            if ($stmt->execute()) {
                // Update project progress if provided
                if (isset($data->progress)) {
                    $updateQuery = "UPDATE projects SET progress = :progress WHERE id = :project_id";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(':progress', $data->progress);
                    $updateStmt->bindParam(':project_id', $data->project_id);
                    $updateStmt->execute();
                }
                
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Status update added successfully',
                    'id' => $db->lastInsertId()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to add status update']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Project ID, update text, and user are required']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
?>
