<?php
// Enhanced CORS headers for browser compatibility
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Accept, Origin');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get and validate input
$input = file_get_contents("php://input");
$data = json_decode($input);

// Check for JSON parsing errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON format']);
    exit();
}

if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT id, username, password FROM users WHERE username = :username LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch();
        
        // Enhanced password check with better validation
        $isValidPassword = false;
        
        // Check against hardcoded credentials first
        if (($data->username === 'Pavan' && $data->password === 'pavan123') ||
            ($data->username === 'Vineeth' && $data->password === 'vineeth123') ||
            ($data->username === 'Pranay' && $data->password === 'pranay123')) {
            $isValidPassword = true;
        } elseif (password_verify($data->password, $row['password'])) {
            // Check hashed password
            $isValidPassword = true;
        } elseif ($data->password === $row['password']) {
            // Fallback for plain text (not recommended)
            $isValidPassword = true;
        }
        
        if ($isValidPassword) {
            
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
