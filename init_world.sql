-- ═══════════════════════════════════════
--  🌍 AETHERIA — Living World Engine
--  Database Schema v1.0
-- ═══════════════════════════════════════

-- 1. Player profiles
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_jid VARCHAR(100) UNIQUE NOT NULL,
    push_name VARCHAR(100),
    character_name VARCHAR(50),
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    gold INT DEFAULT 100,          -- Mulai dengan 100 gold
    hp INT DEFAULT 100,
    max_hp INT DEFAULT 100,
    reputation INT DEFAULT 0,
    title VARCHAR(100) DEFAULT 'Pengembara Baru',
    current_location VARCHAR(50) DEFAULT 'Kota Awal',
    last_daily_quest DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_reputation (reputation)
);

-- 2. Inventory
CREATE TABLE IF NOT EXISTS player_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_type ENUM('weapon','armor','potion','material','food','special') DEFAULT 'material',
    quantity INT DEFAULT 1,
    description TEXT,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_item (player_id, item_name)
);

-- 3. Achievements
CREATE TABLE IF NOT EXISTS player_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    achievement_key VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_achievement (player_id, achievement_key)
);

-- 4. NPC relationship + memory
CREATE TABLE IF NOT EXISTS npc_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    npc_id VARCHAR(50) NOT NULL,
    relationship INT DEFAULT 0,       -- -100 to 100
    interaction_count INT DEFAULT 0,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_npc_rel (player_id, npc_id)
);

CREATE TABLE IF NOT EXISTS npc_memory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    npc_id VARCHAR(50) NOT NULL,
    player_id INT NOT NULL,
    memory_text TEXT NOT NULL,
    importance ENUM('low','medium','high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_npc_player (npc_id, player_id)
);

-- 5. Quests
CREATE TABLE IF NOT EXISTS quests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    quest_type ENUM('daily','story','world') DEFAULT 'daily',
    title VARCHAR(200) NOT NULL,
    description TEXT,
    objective TEXT,
    reward_xp INT DEFAULT 0,
    reward_gold INT DEFAULT 0,
    reward_item VARCHAR(100) DEFAULT NULL,
    status ENUM('active','completed','failed','expired') DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_player_status (player_id, status)
);

-- 6. World State (key-value global store)
CREATE TABLE IF NOT EXISTS world_state (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default world state
INSERT IGNORE INTO world_state (`key`, `value`) VALUES
('season', 'spring'),
('day_count', '1'),
('world_mood', 'peaceful');


-- 7. NPC Profiles
CREATE TABLE IF NOT EXISTS npc_profiles (
    npc_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    trust INT DEFAULT 50,
    fear INT DEFAULT 10,
    memory_health INT DEFAULT 100,
    mood VARCHAR(50) DEFAULT 'tenang',
    activity VARCHAR(100) DEFAULT 'idle',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
