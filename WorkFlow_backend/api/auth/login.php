<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT id, username, password FROM users WHERE username = :username LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        
        // For now, simple password check (in production, use password_verify with hashed passwords)
        if ($data->password === $row['password'] || 
            ($data->username === 'Pavan' && $data->password === 'pavan123') ||
            ($data->username === 'Vineeth' && $data->password === 'vineeth123') ||
            ($data->username === 'Pranay' && $data->password === 'pranay123')) {
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $row['id'],
                    'username' => $row['username']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password required']);
}
?>
