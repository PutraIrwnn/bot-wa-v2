const IFactionRelationshipRepository = require('./IFactionRelationshipRepository');
const Logger = require('../engine/core/Logger');

class MySqlFactionRelationshipRepository extends IFactionRelationshipRepository {
    constructor(dbPool) {
        super();
        this.db = dbPool;
        this.logger = new Logger('MySqlFactionRelRepo');
    }

    async loadAll(connection = null) {
        const query = 'SELECT source_faction_id, target_faction_id, trust, tension, status, last_event FROM faction_relationships';
        try {
            const client = connection || this.db;
            const [rows] = await client.execute(query);
            
            return rows.map(row => ({
                sourceFactionId: row.source_faction_id,
                targetFactionId: row.target_faction_id,
                trust: row.trust,
                tension: row.tension,
                status: row.status,
                lastEvent: row.last_event
            }));
        } catch (err) {
            this.logger.error('Failed to load faction relationships', err);
            return [];
        }
    }

    async saveState(relationship, connection = null) {
        const query = `
            INSERT INTO faction_relationships 
                (source_faction_id, target_faction_id, trust, tension, status, last_event)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                trust = VALUES(trust), 
                tension = VALUES(tension), 
                status = VALUES(status),
                last_event = VALUES(last_event)
        `;
        const params = [
            relationship.sourceFactionId,
            relationship.targetFactionId,
            relationship.trust,
            relationship.tension,
            relationship.status,
            relationship.lastEvent || null
        ];
        
        try {
            const client = connection || this.db;
            await client.execute(query, params);
        } catch (err) {
            this.logger.error(`Failed to save state for faction relationship ${relationship.sourceFactionId} -> ${relationship.targetFactionId}`, err);
            throw err;
        }
    }
}

module.exports = MySqlFactionRelationshipRepository;
