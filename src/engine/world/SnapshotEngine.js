const DomainEvents = require('../core/DomainEvents');
const WorldSnapshotDTO = require('./WorldSnapshotDTO');

/**
 * SnapshotEngine
 * Mengatur persistensi keadaan dunia (Dual-Level Snapshot).
 */
class SnapshotEngine {
    constructor(eventBus, snapshotRepository, npcEngine) {
        this.eventBus = eventBus;
        this.snapshotRepository = snapshotRepository;
        this.npcEngine = npcEngine;

        this.eventBus.subscribe('world.stateEvolution', this.onStateEvolution.bind(this));
    }

    async onStateEvolution(payload) {
        const { context, isSignificantChange } = payload;

        // Hitung agregasi (Misal: Market Population)
        let marketPopulation = 0;
        for (const npcId in this.npcEngine.npcs) {
            if (this.npcEngine.npcs[npcId].location === 'pasar') {
                marketPopulation++;
            }
        }

        const snapshot = new WorldSnapshotDTO({
            day: context.day,
            weather: context.weather,
            market_population: marketPopulation,
            active_rumors: 0 // Belum ada RumorEngine
        });

        // 1. Current Snapshot (Selalu di-Upsert)
        await this.snapshotRepository.upsertCurrentSnapshot(snapshot);

        // 2. Historical Snapshot (Hanya jika ada perubahan signifikan)
        if (isSignificantChange) {
            await this.snapshotRepository.insertHistoricalSnapshot(snapshot);
        }
    }
}

module.exports = SnapshotEngine;
