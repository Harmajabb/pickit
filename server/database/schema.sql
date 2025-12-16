-- ============================================================================
-- PIKIT - Migration complète avec données (Compatible Node.js)
-- ============================================================================
-- Description : Création BDD + Tables + Données d'exemple
-- Compatible : mysql2 (Node.js) - SANS DELIMITER
-- Version : 2.0 avec système de calendrier
-- ============================================================================

-- ============================================================================
-- CRÉATION DE LA BASE DE DONNÉES
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
    zipcode INT NOT NULL,
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
    categorie VARCHAR(50) NOT NULL,
    parent_id INT DEFAULT NULL,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount_caution INT NOT NULL COMMENT 'Montant de la caution en euros',
    start_location_date DATE NOT NULL,
    end_location_date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    state VARCHAR(20) DEFAULT 'active' COMMENT 'active, inactive, archived',
    categorie_id INT NOT NULL,
    owner_id INT NOT NULL COMMENT 'Propriétaire du matériel',
    
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (categorie_id),
    INDEX idx_owner (owner_id),
    INDEX idx_location (location),
    INDEX idx_state (state),
    INDEX idx_dates (start_location_date, end_location_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    borrow_date DATETIME NOT NULL,
    borrow TINYINT DEFAULT 0 COMMENT '0=non récupéré, 1=récupéré',
    announces_id INT NOT NULL,
    owner_id INT NOT NULL COMMENT 'Propriétaire du matériel',
    borrower_id INT NOT NULL COMMENT 'Emprunteur',
    return_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'ongoing', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    deposit_status ENUM('not_paid', 'paid', 'refunded', 'kept') DEFAULT 'not_paid',
    create_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (announces_id) REFERENCES announces(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_announce (announces_id),
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
    daily_price DECIMAL(10, 2) DEFAULT NULL COMMENT 'Prix spécifique pour ce jour',
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
    user_id INT NOT NULL COMMENT 'Auteur de l avis',
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
    user_id INT NOT NULL COMMENT 'Expéditeur',
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
    reporter_id INT NOT NULL COMMENT 'Utilisateur qui signale',
    description TEXT NOT NULL,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
    handled_by INT DEFAULT NULL COMMENT 'Admin qui traite',
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
    superuser_id INT NOT NULL COMMENT 'Admin qui bannit',
    reason TEXT NOT NULL,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME DEFAULT NULL COMMENT 'NULL = bannissement permanent',
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
-- DONNÉES D'EXEMPLE
-- ============================================================================

-- Users (3 utilisateurs)
INSERT IGNORE INTO users (id, lastname, firstname, zipcode, city, address, email, password, role) VALUES
(1, 'Dupont', 'Jean', 59000, 'Lille', '15 rue de la Paix', 'jean.dupont@email.com', '$2y$10$examplehash123456789', 0),
(2, 'Martin', 'Sophie', 75001, 'Paris', '42 avenue des Champs', 'sophie.martin@email.com', '$2y$10$examplehash987654321', 0),
(3, 'Admin', 'Super', 59000, 'Lille', '1 rue Admin', 'admin@pikit.com', '$2y$10$adminhash123456789', 1);

-- Categories (7 catégories hiérarchiques)
INSERT IGNORE INTO categories (id, categorie, parent_id) VALUES
(1, 'Sports d hiver', NULL),
(2, 'Sports nautiques', NULL),
(3, 'Cyclisme', NULL),
(4, 'Ski', 1),
(5, 'Snowboard', 1),
(6, 'Surf', 2),
(7, 'VTT', 3);

-- Announces (2 annonces)
INSERT IGNORE INTO announces (id, title, description, amount_caution, start_location_date, end_location_date, location, state, categorie_id, owner_id) VALUES
(1, 'Vélo VTT Giant Talon', 'VTT en excellent état, parfait pour la montagne. Taille L, freins à disque hydrauliques.', 200, '2024-12-01', '2025-03-31', 'Lille, Nord', 'active', 7, 1),
(2, 'Planche de Surf Quiksilver', 'Planche de surf 6 2, idéale pour débutants et intermédiaires. Avec housse de protection.', 150, '2024-12-01', '2025-09-30', 'Biarritz, Pyrénées-Atlantiques', 'active', 6, 2);

-- Announces Images (3 images)
INSERT IGNORE INTO announces_images (id, url, announce_id) VALUES
(1, 'https://example.com/images/vtt-giant-1.jpg', 1),
(2, 'https://example.com/images/vtt-giant-2.jpg', 1),
(3, 'https://example.com/images/surf-quiksilver-1.jpg', 2);

-- Borrows (2 réservations)
INSERT IGNORE INTO borrows (id, borrow_date, announces_id, owner_id, borrower_id, return_date, status, deposit_status, borrow) VALUES
(1, '2024-12-20 10:00:00', 2, 2, 1, '2024-12-22 18:00:00', 'confirmed', 'paid', 0),
(2, '2024-12-15 14:00:00', 1, 1, 2, '2024-12-17 14:00:00', 'completed', 'refunded', 1);

-- Availability (disponibilités pour décembre 2024)
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

-- Favorites (2 favoris)
INSERT IGNORE INTO favorites (id, user_id, announces_id, is_favorite) VALUES
(1, 1, 2, 1),
(2, 2, 1, 1);

-- Reviews (2 avis)
INSERT IGNORE INTO reviews (id, subject, review, user_id, announce_id, note, action_moderate) VALUES
(1, 'Excellent VTT !', 'Matériel en parfait état, propriétaire très sympa. Je recommande !', 2, 1, 5, 'approved'),
(2, 'Très bonne planche', 'Parfaite pour débuter, échange facile avec le propriétaire.', 1, 2, 4, 'approved');

-- Messages (2 messages)
INSERT IGNORE INTO messages (id, subject, message, user_id, announce_id, status) VALUES
(1, 'Question sur le VTT', 'Bonjour, le VTT est-il toujours disponible du 20 au 22 décembre ?', 2, 1, 'sent'),
(2, 'Disponibilité planche', 'Salut, possible de louer la planche pour le week-end prochain ?', 1, 2, 'read');

-- Reports (1 signalement)
INSERT IGNORE INTO reports (id, reporter_id, description, status, reported_announce_id) VALUES
(1, 2, 'Cette annonce contient des informations trompeuses sur l état du matériel.', 'pending', 1);

-- User Ban (1 bannissement)
INSERT IGNORE INTO user_ban (id, user_id, superuser_id, reason, end_date, active) VALUES
(1, 2, 3, 'Comportement inapproprié dans les messages - Bannissement temporaire', '2024-12-25 23:59:59', 0);

-- Admin Logs (2 logs)
INSERT IGNORE INTO admin_logs (id, superuser_id, action_type, target_table, target_id, details) VALUES
(1, 3, 'moderate', 'reviews', 1, 'Avis approuvé après vérification'),
(2, 3, 'ban', 'users', 2, 'Utilisateur banni temporairement pour comportement inapproprié');

-- Category Changes (2 changements)
INSERT IGNORE INTO category_changes (id, category_id, superuser_id, action, old_value, new_value) VALUES
(1, 7, 3, 'created', NULL, 'VTT'),
(2, 4, 3, 'updated', 'Ski alpin', 'Ski');