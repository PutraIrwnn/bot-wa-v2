const IPlayerFactionRelationshipRepository = require('./IPlayerFactionRelationshipRepository');
const Logger = require('../engine/core/Logger');

class MySqlPlayerFactionRelRepository extends IPlayerFactionRelationshipRepository {
    constructor(dbPool) {
        super();
        this.db = dbPool;
        this.logger = new Logger('MySqlPlayerFactionRelRepo');
    }

    async loadAll(connection = null) {
        const query = 'SELECT player_id, faction_id, trust, interaction_count, history_log FROM player_faction_relationships';
        try {
            const client = connection || this.db;
            const [rows] = await client.execute(query);
            
            return rows.map(row => ({
                playerId: row.player_id,
                factionId: row.faction_id,
                trust: row.trust,
                interactionCount: row.interaction_count,
                historyLog: row.history_log ? JSON.parse(row.history_log) : []
            }));
        } catch (err) {
            this.logger.error('Failed to load player faction relationships', err);
            return [];
        }
    }

    async saveState(relationship, connection = null) {
        const query = `
            INSERT INTO player_faction_relationships 
                (player_id, faction_id, trust, interaction_count, history_log)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                trust = VALUES(trust), 
                interaction_count = VALUES(interaction_count), 
                history_log = VALUES(history_log)
        `;
        const historyJson = JSON.stringify(relationship.getHistory());
        
        const params = [
            relationship.playerId,
            relationship.factionId,
            relationship.getTrust(),
            relationship.getInteractionCount(),
            historyJson
        ];
        
        try {
            const client = connection || this.db;
            await client.execute(query, params);
        } catch (err) {
            this.logger.error(`Failed to save state for player-faction rel ${relationship.playerId} -> ${relationship.factionId}`, err);
            throw err;
        }
    }
}

module.exports = MySqlPlayerFactionRelRepository;
