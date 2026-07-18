const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDb() {
    console.log('Connecting to database...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wa_bot_db'
    });

    try {
        console.log('Creating factions table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS factions (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                goals TEXT,
                policies TEXT,
                shared_knowledge TEXT,
                reputation_profile TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);
        console.log('Factions table created.');

        console.log('Dropping reputation_profile from factions (Sprint 14 SSOT)...');
        try {
            await pool.execute('ALTER TABLE factions DROP COLUMN reputation_profile;');
            console.log('Column reputation_profile dropped.');
        } catch (e) {
            // Abaikan jika kolom tidak ada
            if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('Column reputation_profile already dropped or does not exist.');
            } else {
                console.log('Warning dropping column:', e.message);
            }
        }

        console.log('Creating player_faction_relationships table...');
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS player_faction_relationships (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_id VARCHAR(50) NOT NULL,
                faction_id VARCHAR(50) NOT NULL,
                trust INT DEFAULT 50,
                interaction_count INT DEFAULT 0,
                history_log TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE,
                UNIQUE KEY unique_player_faction_rel (player_id, faction_id)
            );
        `);
        console.log('player_faction_relationships table created.');
        
    } catch (e) {
        console.error('Error updating db:', e);
    } finally {
        await pool.end();
        console.log('Done.');
    }
}

updateDb();
