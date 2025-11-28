<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight requests
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
        // Get all clients or filter by confirmation status
        $filter = isset($_GET['filter']) ? $_GET['filter'] : '';
        $subStatus = isset($_GET['sub_status']) ? $_GET['sub_status'] : '';
        
        $query = "SELECT * FROM clients";
        $conditions = [];
        
        if ($filter === 'confirmed') {
            $conditions[] = "is_confirmed = 1";
            $conditions[] = "is_lost = 0";
        } elseif ($filter === 'not-confirmed') {
            $conditions[] = "is_confirmed = 0";
            $conditions[] = "is_lost = 0";
        } elseif ($filter === 'lost') {
            $conditions[] = "is_lost = 1";
        } else {
            $conditions[] = "is_lost = 0";
        }
        
        if (!empty($subStatus) && in_array($subStatus, ['in-progress', 'waiting-for-client-response', 'pending-from-our-side'])) {
            $conditions[] = "sub_status = '$subStatus'";
        }
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $clients = $stmt->fetchAll();
        
        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $clients]);
        break;

    case 'POST':
        // Create new client
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->name)) {
            $query = "INSERT INTO clients (name, email, phone, company, address, is_confirmed, is_lost, sub_status, start_date, end_date, budget) 
                      VALUES (:name, :email, :phone, :company, :address, :is_confirmed, :is_lost, :sub_status, :start_date, :end_date, :budget)";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':name', $data->name);
            $stmt->bindParam(':email', $data->email);
            $stmt->bindParam(':phone', $data->phone);
            $stmt->bindParam(':company', $data->company);
            $stmt->bindParam(':address', $data->address);
            
            $isConfirmed = isset($data->is_confirmed) ? $data->is_confirmed : false;
            $isLost = isset($data->is_lost) ? $data->is_lost : false;
            $subStatus = isset($data->sub_status) ? $data->sub_status : 'in-progress';
            $startDate = isset($data->start_date) ? $data->start_date : null;
            $endDate = isset($data->end_date) ? $data->end_date : null;
            $budget = isset($data->budget) ? $data->budget : null;
            
            $stmt->bindParam(':is_confirmed', $isConfirmed, PDO::PARAM_BOOL);
            $stmt->bindParam(':is_lost', $isLost, PDO::PARAM_BOOL);
            $stmt->bindParam(':sub_status', $subStatus);
            $stmt->bindParam(':start_date', $startDate);
            $stmt->bindParam(':end_date', $endDate);
            $stmt->bindParam(':budget', $budget);
            
            if ($stmt->execute()) {
                $newClientId = $db->lastInsertId();
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Client created successfully',
                    'data' => ['id' => $newClientId]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to create client']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Client name is required']);
        }
        break;

    case 'PUT':
        // Update client
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->id)) {
            try {
                // Build dynamic query based on provided fields
                $updates = [];
                $params = [':id' => $data->id];
                
                if (isset($data->name)) {
                    $updates[] = "name = :name";
                    $params[':name'] = $data->name;
                }
                if (isset($data->email)) {
                    $updates[] = "email = :email";
                    $params[':email'] = $data->email;
                }
                if (isset($data->phone)) {
                    $updates[] = "phone = :phone";
                    $params[':phone'] = $data->phone;
                }
                if (isset($data->company)) {
                    $updates[] = "company = :company";
                    $params[':company'] = $data->company;
                }
                if (isset($data->address)) {
                    $updates[] = "address = :address";
                    $params[':address'] = $data->address;
                }
                if (isset($data->isConfirmed)) {
                    $updates[] = "is_confirmed = :is_confirmed";
                    $params[':is_confirmed'] = $data->isConfirmed ? 1 : 0;
                }
                if (isset($data->isLost)) {
                    $updates[] = "is_lost = :is_lost";
                    $params[':is_lost'] = $data->isLost ? 1 : 0;
                }
                if (isset($data->startDate)) {
                    $updates[] = "start_date = :start_date";
                    $params[':start_date'] = $data->startDate;
                }
                if (isset($data->endDate)) {
                    $updates[] = "end_date = :end_date";
                    $params[':end_date'] = $data->endDate;
                }
                if (isset($data->budget)) {
                    $updates[] = "budget = :budget";
                    $params[':budget'] = $data->budget;
                }
                if (isset($data->projects)) {
                    $updates[] = "projects = :projects";
                    $params[':projects'] = $data->projects;
                }
                if (isset($data->activeProjects)) {
                    $updates[] = "active_projects = :active_projects";
                    $params[':active_projects'] = $data->activeProjects;
                }
                if (isset($data->subStatus)) {
                    $updates[] = "sub_status = :sub_status";
                    $params[':sub_status'] = $data->subStatus;
                }
                
                if (empty($updates)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'No fields to update']);
                    break;
                }
                
                $query = "UPDATE clients SET " . implode(', ', $updates) . " WHERE id = :id";
                $stmt = $db->prepare($query);
                
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
                
                if ($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Client updated successfully']);
                } else {
                    $errorInfo = $stmt->errorInfo();
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Database error: ' . $errorInfo[2]]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Client ID is required']);
        }
        break;

    case 'DELETE':
        // Delete client
        $client_id = $_GET['id'] ?? null;
        
        if (!empty($client_id)) {
            // First check if client has any projects
            $checkQuery = "SELECT COUNT(*) as project_count FROM projects WHERE client_id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':id', $client_id);
            $checkStmt->execute();
            $projectCount = $checkStmt->fetch()['project_count'];
            
            if ($projectCount > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Cannot delete client with existing projects. Delete projects first.']);
                break;
            }
            
            $query = "DELETE FROM clients WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $client_id);
            
            if ($stmt->execute()) {
                $rowsAffected = $stmt->rowCount();
                if ($rowsAffected > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Client deleted successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Client not found']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to delete client']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Client ID is required']);
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
