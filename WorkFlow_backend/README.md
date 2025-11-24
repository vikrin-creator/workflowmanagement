# Workflow Management System - PHP Backend

## Setup Instructions

### 1. Database Setup
1. Import the database schema:
   - Open phpMyAdmin or MySQL client
   - Create database: `workflow_management`
   - Import `database/schema.sql`

### 2. Configuration
1. Update database credentials in `config/database.php`:
   ```php
   private $host = 'localhost';        // Your DB host
   private $db_name = 'workflow_management';
   private $username = 'your_username';
   private $password = 'your_password';
   ```

### 3. Hostinger Deployment

#### File Structure on Hostinger:
```
public_html/
├── api/
│   ├── auth/
│   │   └── login.php
│   ├── clients/
│   │   └── index.php
│   ├── projects/
│   │   └── index.php
│   ├── status/
│   │   └── index.php
│   └── dashboard/
│       └── stats.php
├── config/
│   └── database.php
└── .htaccess
```

#### Upload Files:
1. Use File Manager or FTP to upload all files
2. Place backend files in `public_html/api/` directory
3. Update `config/database.php` with Hostinger database credentials

#### Get Database Credentials from Hostinger:
1. Go to hPanel → MySQL Databases
2. Note down:
   - Database name
   - Username
   - Password
   - Hostname (usually localhost)

### 4. API Endpoints

**Base URL:** `https://yourdomain.com/api`

#### Authentication
- `POST /auth/login.php` - User login

#### Clients
- `GET /clients/index.php` - Get all clients
- `GET /clients/index.php?filter=confirmed` - Get confirmed clients
- `GET /clients/index.php?filter=not-confirmed` - Get not confirmed clients
- `POST /clients/index.php` - Create new client
- `PUT /clients/index.php` - Update client
- `DELETE /clients/index.php` - Delete client

#### Projects
- `GET /projects/index.php` - Get all projects
- `GET /projects/index.php?client_id=1` - Get projects by client
- `POST /projects/index.php` - Create new project
- `PUT /projects/index.php` - Update project
- `DELETE /projects/index.php` - Delete project

#### Status Updates
- `GET /status/index.php?project_id=1` - Get status updates for project
- `POST /status/index.php` - Add new status update

#### Dashboard
- `GET /dashboard/stats.php` - Get dashboard statistics

### 5. Testing Locally

#### Using XAMPP/WAMP:
1. Place backend folder in `htdocs/` or `www/`
2. Start Apache and MySQL
3. Access: `http://localhost/WorkFlow_backend/api/`

#### Test with Postman or curl:
```bash
# Login
curl -X POST http://localhost/WorkFlow_backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"Pavan","password":"pavan123"}'

# Get clients
curl http://localhost/WorkFlow_backend/api/clients/index.php
```

### 6. Frontend Configuration

Update your React frontend to use the API:
```javascript
// In your React app, create a config file
export const API_BASE_URL = 'https://yourdomain.com/api';

// Or for local testing
export const API_BASE_URL = 'http://localhost/WorkFlow_backend/api';
```

### 7. Security Notes for Production

1. **Update passwords in database.php**
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (Hostinger provides free SSL)
4. **Update CORS settings** to specific domain instead of '*'
5. **Add input validation and sanitization**
6. **Implement proper password hashing** (already prepared in schema.sql)

### 8. Required PHP Extensions (Enable in Hostinger)
- PDO
- pdo_mysql
- json
- mbstring

## Default Users
- Username: Pavan, Password: pavan123
- Username: Vineeth, Password: vineeth123
- Username: Pranay, Password: pranay123
