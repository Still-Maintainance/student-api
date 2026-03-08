-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample schools data
INSERT INTO schools (name, address, latitude, longitude) VALUES
('Central High School', '123 Main St, New York', 40.7128, -74.0060),
('North Academy', '456 Park Ave, New York', 40.7282, -73.7949),
('East Middle School', '789 Madison Ave, New York', 40.7614, -73.9776),
('West Preparatory', '321 5th Ave, New York', 40.7489, -73.9680);

-- Insert sample students data
INSERT INTO students (name, email, phone) VALUES
('John Doe', 'john@example.com', '1234567890'),
('Jane Smith', 'jane@example.com', '0987654321'),
('Bob Johnson', 'bob@example.com', '5555555555'),
('Alice Williams', 'alice@example.com', '1111111111');
