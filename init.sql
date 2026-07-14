CREATE DATABASE IF NOT EXISTS wa_bot_db;
USE wa_bot_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS groups_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jid VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_welcome_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Scores: Tracks every game round played by users
-- Supports multiple game types for future extensibility
CREATE TABLE IF NOT EXISTS game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_jid VARCHAR(100) NOT NULL,
    push_name VARCHAR(100) DEFAULT NULL,
    game_type VARCHAR(50) NOT NULL,
    points INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sender (sender_jid),
    INDEX idx_game (game_type),
    INDEX idx_played (played_at)
);
