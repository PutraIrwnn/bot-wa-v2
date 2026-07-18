const INpcRepository = require('./INpcRepository');
const Logger = require('../engine/core/Logger');

class MySqlNpcRepository extends INpcRepository {
    constructor(dbPool) {
        super();
        this.db = dbPool;
        this.logger = new Logger('MySqlNpcRepo');
    }

    /**
     * @param {Object} connection - Opsional, digunakan untuk UnitOfWork
     */
    async loadAll(connection = null) {
        const query = 'SELECT npc_id as id, name, trust, fear, memory_health, mood, activity, faction_id, faction_role_weight FROM npc_profiles';
        try {
            const client = connection || this.db;
            const [rows] = await client.execute(query);
            
            // Format ulang schedule (sementara di RAM, kelak di table terpisah jika perlu)
            const npcs = {};
            for (const row of rows) {
                npcs[row.id] = {
                    id: row.id,
                    name: row.name,
                    trust: row.trust,
                    fear: row.fear,
                    memory_health: row.memory_health,
                    mood: row.mood,
                    activity: row.activity,
                    faction_id: row.faction_id,
                    faction_role_weight: row.faction_role_weight !== null ? row.faction_role_weight : 5,
                    // Default schedule (sementara hardcoded, sebaiknya direlasikan)
                    schedule: {
                        '08:00': { activity: 'membuka toko', mood: 'semangat' },
                        '12:00': { activity: 'makan siang', mood: 'tenang' },
                        '18:00': { activity: 'menutup toko', mood: 'lelah' },
                        '22:00': { activity: 'tidur', mood: 'damai' }
                    }
                };
            }
            return npcs;
        } catch (err) {
            this.logger.error('Failed to load all NPCs', err);
            return {};
        }
    }

    /**
     * Menyimpan state tunggal NPC.
     * Menerima koneksi opsional jika sedang berada dalam UnitOfWork transaction.
     */
    async saveState(npc, connection = null) {
        const query = `
            INSERT INTO npc_profiles (npc_id, name, trust, fear, memory_health, mood, activity, faction_id, faction_role_weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                trust = VALUES(trust), 
                fear = VALUES(fear), 
                memory_health = VALUES(memory_health), 
                mood = VALUES(mood), 
                activity = VALUES(activity),
                faction_id = VALUES(faction_id),
                faction_role_weight = VALUES(faction_role_weight)
        `;
        const params = [npc.id, npc.name, npc.trust, npc.fear, npc.memory_health, npc.mood, npc.activity, npc.faction_id || null, npc.faction_role_weight || 5];
        
        try {
            const client = connection || this.db;
            await client.execute(query, params);
        } catch (err) {
            this.logger.error(`Failed to save state for NPC: ${npc.id}`, err);
            throw err; // Lempar ke pemanggil atau UoW agar bisa di-rollback
        }
    }
}

module.exports = MySqlNpcRepository;
