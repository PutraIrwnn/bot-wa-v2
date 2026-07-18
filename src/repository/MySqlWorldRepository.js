const IWorldRepository = require('./IWorldRepository');
const Logger = require('../engine/core/Logger');

class MySqlWorldRepository extends IWorldRepository {
    constructor(dbPool) {
        super();
        this.db = dbPool;
        this.logger = new Logger('MySqlWorldRepo');
    }

    async loadState() {
        const query = 'SELECT `key`, `value` FROM world_state';
        try {
            const [rows] = await this.db.execute(query);
            const state = {};
            for (const row of rows) {
                // Asumsi value disimpan sebagai string JSON
                try {
                    state[row.key] = JSON.parse(row.value);
                } catch (e) {
                    state[row.key] = row.value;
                }
            }
            return state;
        } catch (err) {
            this.logger.error('Failed to load world state', err);
            return {};
        }
    }

    async saveState(key, value, connection = null) {
        const query = `
            INSERT INTO world_state (\`key\`, \`value\`) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE \`value\` = ?
        `;
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const params = [key, strValue, strValue];
        
        try {
            const client = connection || this.db;
            await client.execute(query, params);
        } catch (err) {
            this.logger.error(`Failed to save world state for key: ${key}`, err);
            throw err;
        }
    }
}

module.exports = MySqlWorldRepository;
