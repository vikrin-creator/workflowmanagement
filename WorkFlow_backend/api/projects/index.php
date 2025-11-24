<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
        // Get all projects or filter by client
        $clientId = isset($_GET['client_id']) ? $_GET['client_id'] : '';
        
        $query = "SELECT p.*, c.name as client_name, c.email as client_email, c.phone as client_phone 
                  FROM projects p 
                  LEFT JOIN clients c ON p.client_id = c.id";
        
        if (!empty($clientId)) {
            $query .= " WHERE p.client_id = :client_id";
        }
        
        $query .= " ORDER BY p.created_at DESC";
        
        $stmt = $db->prepare($query);
        
        if (!empty($clientId)) {
            $stmt->bindParam(':client_id', $clientId);
        }
        
        $stmt->execute();
        $projects = $stmt->fetchAll();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $projects]);
        break;

    case 'POST':
        // Create new project
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->name) && !empty($data->client_id)) {
            $query = "INSERT INTO projects (name, type, client_id, requirements, budget, status, progress, start_date, deadline) 
                      VALUES (:name, :type, :client_id, :requirements, :budget, :status, :progress, :start_date, :deadline)";
            
            $stmt = $db->prepare($query);
            
            $status = isset($data->status) ? $data->status : 'in-progress';
            $progress = isset($data->progress) ? $data->progress : 0;
            $startDate = isset($data->start_date) ? $data->start_date : null;
            $deadline = isset($data->deadline) ? $data->deadline : null;
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':type', $data->type);
            $stmt->bindParam(':client_id', $data->client_id);
            $stmt->bindParam(':requirements', $data->requirements);
            $stmt->bindParam(':budget', $data->budget);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':progress', $progress);
            $stmt->bindParam(':start_date', $startDate);
            $stmt->bindParam(':deadline', $deadline);
            
            if ($stmt->execute()) {
                $projectId = $db->lastInsertId();
                
                // Update client's project count
                $updateQuery = "UPDATE clients SET projects = projects + 1, active_projects = active_projects + 1 WHERE id = :client_id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(':client_id', $data->client_id);
                $updateStmt->execute();
                
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Project created successfully',
                    'data' => ['id' => $projectId]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create project']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Project name and client ID are required']);
        }
        break;

    case 'PUT':
        // Update project
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            try {
                // Check if this is a status-only update
                $isStatusOnly = isset($data->status) && 
                               !isset($data->name) && 
                               !isset($data->type) && 
                               !isset($data->requirements) && 
                               !isset($data->budget);
                
                if ($isStatusOnly) {
                    // Simple status update
                    $query = "UPDATE projects SET status = :status WHERE id = :id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':status', $data->status);
                    $stmt->bindParam(':id', $data->id);
                } else {
                    // Full project update
                    $query = "UPDATE projects SET 
                              name = :name,
                              type = :type,
                              requirements = :requirements,
                              budget = :budget,
                              status = :status,
                              progress = :progress,
                              start_date = :start_date,
                              deadline = :deadline
                              WHERE id = :id";
                    
                    $stmt = $db->prepare($query);
                    
                    $stmt->bindParam(':name', $data->name);
                    $stmt->bindParam(':type', $data->type);
                    $stmt->bindParam(':requirements', $data->requirements);
                    $stmt->bindParam(':budget', $data->budget);
                    $stmt->bindParam(':status', $data->status);
                    $stmt->bindParam(':progress', $data->progress);
                    $stmt->bindParam(':start_date', $data->start_date);
                    $stmt->bindParam(':deadline', $data->deadline);
                    $stmt->bindParam(':id', $data->id);
                }
                
                if ($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Project updated successfully']);
                } else {
                    $errorInfo = $stmt->errorInfo();
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Database error: ' . $errorInfo[2]]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Project ID is required']);
        }
        break;

    case 'DELETE':
        // Delete project
        $project_id = $_GET['id'] ?? null;
        
        if (!empty($project_id)) {
            // Get client_id before deleting
            $getQuery = "SELECT client_id FROM projects WHERE id = :id";
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(':id', $project_id);
            $getStmt->execute();
            $project = $getStmt->fetch();
            
            $query = "DELETE FROM projects WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $project_id);
            
            if ($stmt->execute()) {
                // Update client's project count
                if ($project) {
                    $updateQuery = "UPDATE clients SET projects = projects - 1 WHERE id = :client_id AND projects > 0";
                    $updateStmt = $db->prepare($updateQuery);
                    $updateStmt->bindParam(':client_id', $project['client_id']);
                    $updateStmt->execute();
                }
                
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Project deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete project']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Project ID is required']);
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
