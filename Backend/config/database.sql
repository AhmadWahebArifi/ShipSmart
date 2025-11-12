-- ShipSmart Database Schema
-- Run this script to create the database

CREATE DATABASE IF NOT EXISTS shipsmart_db;
USE shipsmart_db;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'superadmin', 'user', 'driver', 'client') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    capacity DECIMAL(10, 2),
    status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
    driver_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

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
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_address TEXT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_address TEXT NOT NULL,
    route_id INT,
    vehicle_id INT,
    status ENUM('pending', 'assigned', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    weight DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Insert sample data (optional)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@shipsmart.com', '$2a$10$YourHashedPasswordHere', 'admin'),
('driver1', 'driver1@shipsmart.com', '$2a$10$YourHashedPasswordHere', 'driver');