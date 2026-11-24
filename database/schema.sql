CREATE DATABASE IF NOT EXISTS ecotrack_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecotrack_ai;
CREATE TABLE IF NOT EXISTS users (
 user_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL,
 email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL,
 role ENUM('citizen','worker','admin') NOT NULL DEFAULT 'citizen',
 is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS complaints (
 complaint_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL,
 category ENUM('Plastic','Paper','Metal','Glass','Organic','Mixed Waste','Other') NOT NULL,
 description TEXT NOT NULL, location_text VARCHAR(255) NOT NULL,
 latitude DECIMAL(10,7) NULL, longitude DECIMAL(10,7) NULL, image_path VARCHAR(255) NULL,
 status ENUM('Submitted','Under Review','Assigned','In Progress','Resolved') NOT NULL DEFAULT 'Submitted',
 priority ENUM('Low','Medium','High','Urgent') NOT NULL DEFAULT 'Medium',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(user_id), INDEX(status), INDEX(created_at)
);
CREATE TABLE IF NOT EXISTS assignments (
 assignment_id INT AUTO_INCREMENT PRIMARY KEY, complaint_id INT NOT NULL, worker_id INT NOT NULL,
 assigned_by INT NOT NULL, assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 status ENUM('Assigned','In Progress','Resolved','Reassigned') NOT NULL DEFAULT 'Assigned',
 FOREIGN KEY(complaint_id) REFERENCES complaints(complaint_id),
 FOREIGN KEY(worker_id) REFERENCES users(user_id), FOREIGN KEY(assigned_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS status_history (
 history_id INT AUTO_INCREMENT PRIMARY KEY, complaint_id INT NOT NULL, changed_by INT NOT NULL,
 old_status VARCHAR(40), new_status VARCHAR(40) NOT NULL, note VARCHAR(500),
 changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(complaint_id) REFERENCES complaints(complaint_id), FOREIGN KEY(changed_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS ai_predictions (
 prediction_id INT AUTO_INCREMENT PRIMARY KEY, complaint_id INT NOT NULL,
 predicted_class VARCHAR(80) NOT NULL, confidence DECIMAL(5,4), model_version VARCHAR(80),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(complaint_id) REFERENCES complaints(complaint_id)
);
CREATE TABLE IF NOT EXISTS collections (
 collection_id INT AUTO_INCREMENT PRIMARY KEY, assignment_id INT NOT NULL,
 collected_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0, completion_photo VARCHAR(255),
 collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(assignment_id) REFERENCES assignments(assignment_id)
);
