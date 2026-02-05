-- ============================================================================
-- PIKIT - Complete Migration with Data (Node.js Compatible)
-- ============================================================================
-- Description: Database Creation + Tables + Sample Data
-- Compatible: mysql2 (Node.js) - WITHOUT DELIMITER
-- Version: 2.0 with calendar system
-- ============================================================================

-- ============================================================================
-- DATABASE CREATION
-- ============================================================================

CREATE DATABASE IF NOT EXISTS pickit 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE pickit;

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lastname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    zipcode VARCHAR(10) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    token7d TEXT DEFAULT NULL,
    profil_picture VARCHAR(255) DEFAULT NULL,
    update_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TINYINT(1) DEFAULT 0 COMMENT '0=user, 1=admin',
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    parent_id INT DEFAULT NULL,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount_deposit INT NOT NULL COMMENT 'Deposit amount in euros',
    creation_date DATE NOT NULL,
    update_date DATE,
    start_borrow_date DATE NOT NULL,
    end_borrow_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' COMMENT 'active, inactive, archived',
    zipcode VARCHAR(10) NOT NULL,
    category_id INT NOT NULL,
    owner_id INT NOT NULL COMMENT 'Equipment owner',
    state_of_product ENUM('new', 'excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category_id),
    INDEX idx_owner (owner_id),
    INDEX idx_location (location),
    INDEX idx_status (status),
    INDEX idx_dates (start_borrow_date, end_borrow_date),
    INDEX idx_zipcode (zipcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_date DATETIME NOT NULL,
    borrow TINYINT DEFAULT 0 COMMENT '0=not picked up, 1=picked up',
    announces_id INT NOT NULL,
    owner_id INT NOT NULL COMMENT 'Equipment owner',
    borrower_id INT NOT NULL COMMENT 'Borrower',
    return_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'returned', 'object_broken','cancelled', 'rejected') DEFAULT 'pending',
    deposit_status ENUM('not_paid', 'authorized', 'refunded', 'kept', 'paid') DEFAULT 'not_paid',
    payment_intent_id varchar(255) DEFAULT NULL COMMENT 'Stripe session number for payment tracking',
    amount_refunded DECIMAL(10, 2) DEFAULT NULL COMMENT 'Amount refunded when object is broken',
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announces_id) REFERENCES announces(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_payment_intent_id (payment_intent_id),
    INDEX idx_borrower (borrower_id),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status),
    INDEX idx_dates (borrow_date, return_date),
    INDEX idx_announce_dates (announces_id, borrow_date, return_date, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    announce_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('available', 'booked', 'blocked', 'maintenance') DEFAULT 'available',
    borrow_id INT DEFAULT NULL,
    daily_price DECIMAL(10, 2) DEFAULT NULL COMMENT 'Specific price for this day',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announce_id) REFERENCES announces(id) ON DELETE CASCADE,
    FOREIGN KEY (borrow_id) REFERENCES borrows(id) ON DELETE SET NULL,
    
    CONSTRAINT unique_announce_date UNIQUE (announce_id, date),
    INDEX idx_announce_date (announce_id, date),
    INDEX idx_status (status),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announces_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    announce_id INT NOT NULL,
    
    FOREIGN KEY (announce_id) REFERENCES announces(id) ON DELETE CASCADE,
    INDEX idx_announce (announce_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    announces_id INT NOT NULL,
    is_favorite TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announces_id) REFERENCES announces(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_announce (user_id, announces_id),
    INDEX idx_user (user_id),
    INDEX idx_announce (announces_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(50) NOT NULL,
    review TEXT NOT NULL,
    user_id INT NOT NULL COMMENT 'Review author',
    announce_id INT NOT NULL,
    note TINYINT NOT NULL CHECK (note >= 1 AND note <= 5),
    moderate_by INT DEFAULT NULL,
    moderate_date DATETIME DEFAULT NULL,
    action_moderate ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
    moderate_reason TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announce_id) REFERENCES announces(id) ON DELETE CASCADE,
    FOREIGN KEY (moderate_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_announce (announce_id),
    INDEX idx_note (note),
    INDEX idx_moderation (action_moderate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    user_id INT NOT NULL COMMENT 'Sender',
    announce_id INT DEFAULT NULL,
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    moderate_by INT DEFAULT NULL,
    moderation_reason TEXT DEFAULT NULL,
    status ENUM('sent', 'read', 'archived', 'moderated') DEFAULT 'sent',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announce_id) REFERENCES announces(id) ON DELETE SET NULL,
    FOREIGN KEY (moderate_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_announce (announce_id),
    INDEX idx_status (status),
    INDEX idx_date (create_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL COMMENT 'User reporting',
    description TEXT NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
    handled_by INT DEFAULT NULL COMMENT 'Admin handling the report',
    resolution_note TEXT DEFAULT NULL,
    reported_user_id INT DEFAULT NULL,
    reported_review_id INT DEFAULT NULL,
    reported_message_id INT DEFAULT NULL,
    reported_announce_id INT DEFAULT NULL,
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_announce_id) REFERENCES announces(id) ON DELETE CASCADE,
    
    INDEX idx_reporter (reporter_id),
    INDEX idx_status (status),
    INDEX idx_date (creation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_ban (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    superuser_id INT NOT NULL COMMENT 'Admin who banned',
    reason TEXT NOT NULL,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME DEFAULT NULL COMMENT 'NULL = permanent ban',
    active TINYINT(1) DEFAULT 1,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (superuser_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_active (active),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    superuser_id INT NOT NULL,
    action_type VARCHAR(80) NOT NULL COMMENT 'create, update, delete, ban, moderate',
    target_table VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    details TEXT DEFAULT NULL,
    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (superuser_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_superuser (superuser_id),
    INDEX idx_action (action_type),
    INDEX idx_target (target_table, target_id),
    INDEX idx_date (action_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    superuser_id INT NOT NULL,
    action ENUM('created', 'updated', 'deleted') NOT NULL,
    old_value TEXT DEFAULT NULL,
    new_value TEXT DEFAULT NULL,
    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (superuser_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category_id),
    INDEX idx_superuser (superuser_id),
    INDEX idx_date (change_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Users (3 users)
INSERT IGNORE INTO users (id, lastname, firstname, zipcode, city, address, email, password, role) VALUES
(1, 'Dupont', 'Jean', 59000, 'Lille', '15 Peace Street', 'jean.dupont@email.com', '$2y$10$examplehash123456789', 0),
(2, 'Martin', 'Sophie', 75001, 'Paris', '42 Champs Avenue', 'sophie.martin@email.com', '$2y$10$examplehash987654321', 0),
(3, 'Admin', 'Super', 59000, 'Lille', '1 Admin Street', 'admin@pikit.com', '$argon2id$v=19$m=65536,t=3,p=4$6zcB46Y9IU2r2kJ/Fet/mA$8LbkGbb9ApXd+HoxkVAcW/Qf+T0f5rngWKwooWaNyHw', 1),
(4, 'Fourdin', 'Pierre', 59000, 'Lille', '1 Admin Street', 'fourdin.pfmg@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$ZA4+JPXRjS9Jq6zsd6d3Fw$t2wRQ4TOyKPT5swyogbIhxG8gzeZ/EBpamZNFrBh4uc', 1);

-- Categories (7 hierarchical categories)
INSERT IGNORE INTO categories (id, category, parent_id) VALUES
(1, 'Winter Sports', NULL),
(2, 'Water Sports', NULL),
(3, 'Cycling', NULL),
(4, 'Skiing', 1),
(5, 'Snowboarding', 1),
(6, 'Surfing', 2),
(7, 'Mountain Biking', 3);

-- Announces (2 listings)

INSERT IGNORE INTO announces (id, title, description, amount_deposit, creation_date, update_date, start_borrow_date, end_borrow_date, location, status, zipcode, category_id, owner_id, state_of_product) VALUES
(1, "Giant Talon Mountain Bike", "Mountain bike in excellent condition, perfect for mountains. Size L, hydraulic disc brakes.", 200, '2024-10-09', '2024-10-31', '2024-12-01', '2025-03-31', "Lille, Nord", 'active', 59000, 7, 1, 'excellent'),
(2, "Quiksilver Surfboard", "surfboard, ideal for beginners and intermediates. Includes protective cover.", 150, '2024-11-25', NULL, '2024-12-01', '2025-09-30', "Biarritz, Pyrénées-Atlantiques", 'active', 64200, 6, 2, 'good'),
(3, "Raquette de Tennis Wilson Pro Staff", "Modèle utilisé par les pros. Cordage neuf, grip changé récemment. Poids 315g.", 50, '2024-12-01', '2024-12-05', '2024-12-10', '2025-06-30', "Lyon, Rhône", 'active', 69000, 5, 3, 'new'),
(6, "Paddle Gonflable Itiwit", "Pack complet avec pompe, pagaie et sac de transport. Idéal pour balades en lac ou mer calme.", 120, '2024-10-20', '2024-11-02', '2025-05-01', '2025-09-30', "Annecy, Haute-Savoie", 'active', 74000, 6, 1, 'new'),
(9, "Rollers en ligne Rollerblade", "Pointure 42. Roues 80mm, roulements ABEC 7. Confortables pour la rando urbaine.", 30, '2024-12-12', NULL, '2024-12-15', '2025-12-31', "Montpellier, Hérault", 'active', 34000, 7, 3, 'new'),
(11, "Ballon de piscine", "Très beau ballon de piscine tout neuf pour surfer dans la joie et la bonne humeur", 5, '2026-01-30', '2026-01-30', '2026-01-30', '2026-02-28', 'Paris', 'active', 75018, 6, 3, 'good'),
(12, "Bike helmet", "Casque de VTT léger et résistant, offrant une protection optimale et une ventilation efficace pour rouler en toute sécurité et confort sur tous les terrains.", 50, '2026-02-02', NULL, '2026-02-02', '2027-08-05', 'Lyon', 'active', 59000, 7, 4, 'excellent'),
(13, "Raquettes de randonnée", "Raquettes légères et robustes, conçues pour offrir une excellente accroche et une stabilité optimale lors de vos sorties sur terrains enneigés.", 80, '2026-02-02', '2026-02-02', '2026-02-02', '2028-05-02', 'Lyon', 'active', 69000, 1, 4, 'good'),
(14, "Sacoche de VTT", "Sacoche de guidon pratique et résistante, idéale pour transporter l’essentiel en toute sécurité tout en restant facilement accessible pendant vos sorties à vélo.", 30, '2026-02-02', NULL, '2026-02-03', '2032-08-04', 'Lyon', 'active', 69000, 3, 3, 'fair'),
(15, "Paire de skis", "Paire de skis polyvalente et performante, offrant une excellente stabilité et une glisse fluide pour un maximum de plaisir sur tous types de neige.", 250, '2026-02-02', NULL, '2026-02-25', '2028-04-12', 'Paris', 'active', 75020, 4, 3, 'excellent'),
(16, "Snowboard", "Snowboard design polyvalent et performant, offrant une excellente stabilité et une glisse fluide pour un maximum de plaisir sur tous types de neige.", 200, '2026-02-02', NULL, '2026-02-26', '2026-12-14', 'Paris', 'active', 75020, 1, 3, 'good'),
(17, "VTT", "VTT robuste et polyvalent, conçu pour offrir un excellent contrôle et un confort optimal sur tous les sentiers, des chemins roulants aux terrains les plus techniques.", 250, '2026-02-02', NULL, '2026-03-23', '2030-12-31', 'Lille', 'active', 59000, 3, 3, 'good');

-- Announces Images (25 images)
INSERT IGNORE INTO announces_images (id, url, announce_id) VALUES
(1, '2025-Giant-Talon-2.jpeg.webp', 1),
(2, 'ART000146698002.jpg', 2),
(3, 'ART000146698001.jpg', 2),
(4, 'raquette-de-tennis-adulte-wilson-pro-staff-97-ls-v14-noir-290g.avif', 3),
(5, 'e77cbda607bdd5b645676d59cfc78e3bf9d6bfd7_H26ROSSSKI513763_0.webp', 4),
(6, 'stand-up-paddle-gonflable-debutant-compact-m-blanc-et-vert-4282237345.jpg', 6),
(7, 'sac-a-dos-de-randonnee-trekking-70-litres-noir-bleu-4283248734.jpg', 7),
(8, 'callaway-série-de-fers-rogue-st-max-5-pw-droitier-shaft-acier-regulier-4284058731.jpg', 8),
(9, 'Rollers-Rollerblade.webp', 9),
(10, 'escalade.jpg', 10),
(11, 'c0af78e9-ed53-4b62-994b-9506f37aae7c.jpg', 11),
(12, '218f2549-79c1-47d6-9a59-350cc82c2fb5.jpg', 11),
(13, '0bdbaffd-9d50-45c9-a22b-e51400adcd97.jpg', 12),
(14, 'ae359153-6ff4-4e62-8b1c-db3c71453610.jpg', 12),
(15, '7d60b14d-6ccd-4e6c-b921-5269307aa5b2.jpg', 12),
(16, 'aa0e6120-c43a-44f6-822b-3863ee0da2de.jpg', 13),
(17, '57a6eaf5-c927-4aae-9c92-47b358ad3153.jpg', 13),
(18, '531480ce-eb84-4e84-a272-6b5adeb681b1.jpg', 14),
(19, 'bdea04d5-a866-4bdd-a9cd-cd6a81734e2d.jpg', 14),
(20, 'b4c132fc-ca65-4268-8e76-3c15e4df5309.jpg', 14),
(21, '2327a81f-4308-41cb-b097-8e694dec75d8.jpg', 15),
(22, 'be97103e-989c-4f6b-bdb0-bd7566831a2a.jpg', 15),
(23, 'd3901914-b20d-4140-bb61-964e18f0240c.jpg', 15),
(24, 'f0ad4a2b-c309-467b-be61-7c41a0a160c9.jpg', 16),
(25, '38f72c65-1a1a-44a6-b1d1-9bf4e4a9895f.jpg', 17);


-- Borrows (2 bookings)
INSERT IGNORE INTO borrows (id, borrow_date, announces_id, owner_id, borrower_id, return_date, status, deposit_status, borrow) VALUES
(1, '2024-12-20 10:00:00', 2, 2, 1, '2024-12-22 18:00:00', 'confirmed', 'paid', 0),
(2, '2024-12-15 14:00:00', 1, 1, 2, '2024-12-17 14:00:00', 'completed', 'refunded', 1);

-- Availability (availability for December 2024)
INSERT IGNORE INTO availability (id, announce_id, date, status, borrow_id, daily_price) VALUES
(1, 1, '2024-12-15', 'booked', 2, 25.00),
(2, 1, '2024-12-16', 'booked', 2, 25.00),
(3, 1, '2024-12-17', 'booked', 2, 25.00),
(4, 1, '2024-12-18', 'available', NULL, 25.00),
(5, 1, '2024-12-19', 'available', NULL, 25.00),
(6, 1, '2024-12-20', 'available', NULL, 25.00),
(7, 1, '2024-12-25', 'blocked', NULL, NULL),
(8, 2, '2024-12-15', 'available', NULL, 30.00),
(9, 2, '2024-12-16', 'available', NULL, 30.00),
(10, 2, '2024-12-20', 'booked', 1, 30.00),
(11, 2, '2024-12-21', 'booked', 1, 30.00),
(12, 2, '2024-12-22', 'booked', 1, 30.00);

-- Favorites (2 favorites)
INSERT IGNORE INTO favorites (id, user_id, announces_id, is_favorite) VALUES
(1, 1, 2, 1),
(2, 2, 1, 1);

-- Reviews (2 reviews)
INSERT IGNORE INTO reviews (id, subject, review, user_id, announce_id, note, action_moderate) VALUES
(1, 'Excellent Mountain Bike!', 'Equipment in perfect condition, very friendly owner. I recommend!', 2, 1, 5, 'approved'),
(2, 'Very Good Board', 'Perfect for beginners, easy exchange with the owner.', 1, 2, 4, 'approved');

-- Messages (2 messages)
INSERT IGNORE INTO messages (id, subject, message, user_id, announce_id, status) VALUES
(1, 'Question about the Mountain Bike', 'Hello, is the mountain bike still available from December 20 to 22?', 2, 1, 'sent'),
(2, 'Board Availability', 'Hi, is it possible to rent the board for next weekend?', 1, 2, 'read');

-- Reports (1 report)
INSERT IGNORE INTO reports (id, reporter_id, description, status, reported_announce_id) VALUES
(1, 2, 'This listing contains misleading information about the equipment condition.', 'pending', 1);

-- User Ban (1 ban)
INSERT IGNORE INTO user_ban (id, user_id, superuser_id, reason, end_date, active) VALUES
(1, 2, 3, 'Inappropriate behavior in messages - Temporary ban', '2024-12-25 23:59:59', 0);

-- Admin Logs (2 logs)
INSERT IGNORE INTO admin_logs (id, superuser_id, action_type, target_table, target_id, details) VALUES
(1, 3, 'moderate', 'reviews', 1, 'Review approved after verification'),
(2, 3, 'ban', 'users', 2, 'User temporarily banned for inappropriate behavior');

-- Category Changes (2 changes)
INSERT IGNORE INTO category_changes (id, category_id, superuser_id, action, old_value, new_value) VALUES
(1, 7, 3, 'created', NULL, 'Mountain Biking'),
(2, 4, 3, 'updated', 'Alpine Skiing', 'Skiing');

INSERT IGNORE INTO borrows (id, borrow_date, announces_id, owner_id, borrower_id, return_date, status, deposit_status, borrow) VALUES
(3, '2026-02-10 09:00:00', 1, 1, 4, '2026-02-12 18:00:00', 'completed', 'refunded', 1),
(4, '2026-05-15 10:00:00', 6, 1, 4, '2026-05-17 17:00:00', 'confirmed', 'authorized', 0),
(5, '2026-02-26 08:00:00', 16, 3, 4, '2026-02-28 19:00:00', 'pending', 'not_paid', 0),
(6, '2026-03-01 10:00:00', 12, 4, 3, '2026-03-05 16:00:00', 'confirmed', 'authorized', 0),
(7, '2026-03-10 08:30:00', 15, 3, 4, '2026-03-12 17:00:00', 'completed', 'refunded', 1),
(8, '2026-04-15 11:00:00', 13, 4, 3, '2026-04-18 15:30:00', 'pending', 'not_paid', 0);

INSERT IGNORE INTO availability (announce_id, date, status, borrow_id, daily_price) VALUES
(1, '2026-02-10', 'booked', 3, 25.00),
(1, '2026-02-11', 'booked', 3, 25.00),
(1, '2026-02-12', 'booked', 3, 25.00),
(6, '2026-05-15', 'booked', 4, 30.00),
(6, '2026-05-16', 'booked', 4, 30.00),
(6, '2026-05-17', 'booked', 4, 30.00),
(12, '2026-03-01', 'booked', 6, 15.00),
(12, '2026-03-02', 'booked', 6, 15.00),
(12, '2026-03-03', 'booked', 6, 15.00),
(12, '2026-03-04', 'booked', 6, 15.00),
(12, '2026-03-05', 'booked', 6, 15.00),
(13, '2026-04-15', 'booked', 8, 20.00),
(13, '2026-04-16', 'booked', 8, 20.00),
(13, '2026-04-17', 'booked', 8, 20.00),
(13, '2026-04-18', 'booked', 8, 20.00),
(15, '2026-03-10', 'booked', 7, 50.00),
(15, '2026-03-11', 'booked', 7, 50.00),
(15, '2026-03-12', 'booked', 7, 50.00);