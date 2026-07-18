const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

class MockNpcRepository {
    constructor(npcCount) {
        this.npcCount = npcCount;
        this.saved = 0;
    }
    async loadAll() {
        const npcs = {};
        for (let i = 0; i < this.npcCount; i++) {
            npcs[`npc_${i}`] = {
                id: `npc_${i}`,
                name: `NPC ${i}`,
                trust: 50,
                memory_health: 100,
                location: `loc_${i % 10}`,
                faction_id: `F_${i % 10}`,
                knowledge: []
            };
        }
        return npcs;
    }
    async saveState(npc) {
        this.saved++;
    }
}

test('Performance Benchmark: Load Test', async (t) => {
    // 1000 NPCs, 10 Factions, thousands of rumors
    const eventBus = new EventBus();
    const repo = new MockNpcRepository(1000);
    const npcEngine = new NPCEngine(eventBus, repo);
    const rumorEngine = new RumorEngine(eventBus);

    await npcEngine.init();

    // Populate Rumors
    for (let i = 0; i < 2000; i++) {
        rumorEngine.createFactionRumor(`F_${i % 10}`, 'neutral', `Rumor benchmark ${i}`);
    }

    assert.equal(Object.keys(npcEngine.npcs).length, 1000);
    assert.equal(rumorEngine.globalRumors.size, 2000);

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // Run 10 ticks
    for (let tick = 1; tick <= 10; tick++) {
        eventBus.publish(DomainEvents.WorldTick, { totalTicks: tick });
    }

    // Await all async event handlers to finish
    await new Promise(setImmediate);

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const duration = endTime - startTime;
    const memoryDiffMB = (endMemory - startMemory) / 1024 / 1024;

    console.log(`\n--- BENCHMARK RESULTS ---`);
    console.log(`NPC Count: 1000`);
    console.log(`Rumor Count: 2000`);
    console.log(`Ticks simulated: 10`);
    console.log(`Total Duration: ${duration.toFixed(2)} ms`);
    console.log(`Avg Duration per Tick: ${(duration / 10).toFixed(2)} ms`);
    console.log(`Memory Growth: ${memoryDiffMB.toFixed(2)} MB`);
    console.log(`Repository save calls: ${repo.saved}`);
    console.log(`-------------------------\n`);

    // Just assert it finishes without crash
    assert.ok(true);
});
