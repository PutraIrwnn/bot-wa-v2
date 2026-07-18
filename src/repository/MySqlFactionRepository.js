const IFactionRepository = require('./IFactionRepository');
const Logger = require('../engine/core/Logger');

class MySqlFactionRepository extends IFactionRepository {
    constructor(dbPool) {
        super();
        this.db = dbPool;
        this.logger = new Logger('MySqlFactionRepo');
    }

    async loadAll(connection = null) {
        const query = 'SELECT id, name, goals, policies, shared_knowledge FROM factions';
        try {
            const client = connection || this.db;
            const [rows] = await client.execute(query);
            
            const factions = {};
            rows.forEach(row => {
                const data = {
                    id: row.id,
                    name: row.name,
                    goals: row.goals,
                    policies: row.policies,
                    shared_knowledge: row.shared_knowledge ? JSON.parse(row.shared_knowledge) : []
                };
                factions[row.id] = new Faction(data);
            });
            return factions;
        } catch (err) {
            this.logger.error('Failed to load factions', err);
            return {};
        }
    }

    async saveState(faction, connection = null) {
        const query = `
            INSERT INTO factions (id, name, goals, policies, shared_knowledge)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                goals = VALUES(goals), 
                policies = VALUES(policies), 
                shared_knowledge = VALUES(shared_knowledge)
        `;
        const params = [
            faction.id,
            faction.name,
            faction.goals,
            faction.policies,
            JSON.stringify(faction.sharedKnowledge)
        ];
        
        try {
            const client = connection || this.db;
            await client.execute(query, params);
        } catch (err) {
            this.logger.error(`Failed to save state for Faction: ${faction.id}`, err);
            throw err;
        }
    }
}

module.exports = MySqlFactionRepository;
