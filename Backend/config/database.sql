-- ShipSmart Database Schema
-- Run this script to create the database

CREATE DATABASE IF NOT EXISTS shipsmart_db;
USE shipsmart_db;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin', 'user', 'driver', 'client') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add unique constraints manually to avoid key limit issues
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_username UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_email UNIQUE (email);

-- Add columns for user profile and branch information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(100) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS address TEXT NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_pic LONGTEXT NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS province VARCHAR(100) NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS branch VARCHAR(100) NULL DEFAULT NULL;

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10, 2),
    status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
    driver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add unique constraint for license_plate
ALTER TABLE vehicles ADD CONSTRAINT IF NOT EXISTS unique_license_plate UNIQUE (license_plate);

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance DECIMAL(10, 2),
    estimated_time INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL,
    from_province VARCHAR(100) NOT NULL,
    to_province VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'on_route', 'delivered', 'canceled') DEFAULT 'pending',
    sender_id INT NOT NULL,
    receiver_id INT NULL DEFAULT NULL,
    shipped_at TIMESTAMP NULL DEFAULT NULL,
    delivered_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add unique constraint for tracking_number
ALTER TABLE shipments ADD CONSTRAINT IF NOT EXISTS unique_tracking_number UNIQUE (tracking_number);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL DEFAULT 1,
    weight DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    shipment_tracking_number VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_tracking_number) REFERENCES shipments(tracking_number) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Add unique constraint for product name per shipment
-- ALTER TABLE products ADD CONSTRAINT IF NOT EXISTS unique_product_per_shipment UNIQUE (name, shipment_tracking_number);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shipment_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('shipment_created', 'shipment_in_progress', 'shipment_delivered', 'info') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

-- Insert sample data (optional)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@shipsmart.com', '$2a$10$YourHashedPasswordHere', 'admin'),
('driver1', 'driver1@shipsmart.com', '$2a$10$YourHashedPasswordHere', 'driver');