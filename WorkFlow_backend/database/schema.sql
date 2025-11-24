-- For LOCAL development (XAMPP/WAMP), uncomment these lines:
-- CREATE DATABASE IF NOT EXISTS workflow_management;
-- USE workflow_management;

-- For HOSTINGER: Skip the lines above. Just select your database in phpMyAdmin and import from here:

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users (passwords are hashed)
INSERT INTO users (username, password) VALUES 
('Pavan', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: pavan123
('Vineeth', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: vineeth123
('Pranay', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: pranay123

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(100),
    address TEXT,
    is_confirmed BOOLEAN DEFAULT FALSE,
    sub_status ENUM('in-progress', 'waiting-for-client-response', 'pending-from-our-side') DEFAULT 'in-progress',
    start_date DATE,
    end_date DATE,
    budget VARCHAR(50),
    projects INT DEFAULT 0,
    active_projects INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50),
    client_id INT NOT NULL,
    requirements TEXT,
    budget VARCHAR(50),
    status ENUM('in-progress', 'waiting-for-client-response', 'completed') DEFAULT 'in-progress',
    progress INT DEFAULT 0,
    start_date DATE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Status updates table
CREATE TABLE IF NOT EXISTS status_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    progress INT,
    update_text TEXT NOT NULL,
    updated_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_client_confirmed ON clients(is_confirmed);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_project_client ON projects(client_id);
CREATE INDEX idx_status_project ON status_updates(project_id);
