CREATE DATABASE IF NOT EXISTS mediaflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mediaflow;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sessions table will be handled by express-mysql-session, but we can define it or let the library create it.
-- Let's let express-mysql-session handle it, but it creates `sessions` table (usually named `sessions` by default).
-- Let's create it manually just in case, but express-mysql-session can do it if `createDatabaseTable` is true.
-- If the library creates it, it has its own schema. We will configure express-mysql-session to create it.
