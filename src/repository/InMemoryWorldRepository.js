/**
 * Mock Repository untuk World State (simulasi DB)
 */
class InMemoryWorldRepository {
    constructor() {
        this.data = {
            last_tick_time: Date.now() - 3600000 // Simulasi mati 1 jam yang lalu
        };
    }

    async loadState() {
        return this.data;
    }

    async saveState(key, value) {
        this.data[key] = value;
    }
}

module.exports = InMemoryWorldRepository;
