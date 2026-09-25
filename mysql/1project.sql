-- CREATE DATABASE faceattend_ai; 
USE faceattend_ai;

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(100) NOT NULL,
--     email VARCHAR(150) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role VARCHAR(20) DEFAULT 'admin',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE employees (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     employee_code VARCHAR(50) UNIQUE NOT NULL,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(150) UNIQUE NOT NULL,
--     face_encoding TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE attendance (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     employee_id INT NOT NULL,
--     date DATE NOT NULL,
--     check_in TIME NOT NULL,
--     status VARCHAR(20) DEFAULT 'Present',
--     FOREIGN KEY (employee_id)
--         REFERENCES employees(id)
-- );
-- INSERT INTO users (username, email, password, role)
-- VALUES ('admin', 'admin@example.com', 'test123', 'admin');
 SELECT * FROM employees;


-- SELECT id, username, email, password, role
-- FROM users;

-- SELECT id, employee_code, name, email, face_encoding
-- FROM employees;

-- ALTER TABLE attendance
-- ADD CONSTRAINT unique_employee_date
-- UNIQUE (employee_id, date);

-- SELECT * FROM attendance; 
