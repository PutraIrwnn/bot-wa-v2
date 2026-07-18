const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const SnapshotEngine = require('../../src/engine/world/SnapshotEngine');
const InMemorySnapshotRepository = require('../../src/repository/InMemorySnapshotRepository');

// Mock NPCEngine
class MockNPCEngine {
    constructor() {
        this.npcs = {
            'budi': { location: 'pasar' },
            'rina': { location: 'rumah' }
        };
    }
}

test('WorldSnapshot: Dual-Level Persistence Strategy', async (t) => {
    await t.test('Upsert Current Snapshot is always called, but History is only on significant change', async () => {
        const eventBus = new EventBus();
        const repo = new InMemorySnapshotRepository();
        const npcEngine = new MockNPCEngine();
        const snapshotEngine = new SnapshotEngine(eventBus, repo, npcEngine);

        // 1. Trigger event tanpa significant change
        eventBus.publish('world.stateEvolution', {
            context: { day: 1, weather: 'Clear' },
            isSignificantChange: false
        });

        // Tunggu async promise resolution dari pub/sub
        await new Promise(r => setTimeout(r, 10));

        assert.ok(repo.currentSnapshot !== null, 'Current Snapshot tidak diupsert');
        assert.equal(repo.currentSnapshot.market_population, 1, 'Market population salah hitung');
        assert.equal(repo.history.length, 0, 'Historical snapshot seharusnya tidak dibuat untuk minor tick');

        // 2. Trigger event dengan significant change (Misal: Cuaca berubah)
        eventBus.publish('world.stateEvolution', {
            context: { day: 2, weather: 'Rain' },
            isSignificantChange: true
        });

        await new Promise(r => setTimeout(r, 10));

        assert.equal(repo.currentSnapshot.weather, 'Rain', 'Current Snapshot tidak update');
        assert.equal(repo.history.length, 1, 'Historical snapshot gagal di-insert saat significant change');
        assert.equal(repo.history[0].day, 2, 'Data histori salah');
    });
});
