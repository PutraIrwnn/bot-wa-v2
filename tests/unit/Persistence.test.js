const test = require('node:test');
const assert = require('node:assert/strict');
const dbPool = require('../../src/config/db');
const MySqlNpcRepository = require('../../src/repository/MySqlNpcRepository');
const MySqlWorldRepository = require('../../src/repository/MySqlWorldRepository');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');

test('Persistence Layer Integration Tests (MySQL)', async (t) => {
    
    // Pastikan pool ditutup setelah testing agar Node tidak hang
    t.after(() => dbPool.end());

    const npcRepo = new MySqlNpcRepository(dbPool);
    const worldRepo = new MySqlWorldRepository(dbPool);

    await t.test('1. Repository saveState() updates MySQL successfully', async () => {
        // Setup initial dummy NPC state
        const dummyNpc = {
            id: 'rina',
            name: 'Rina',
            trust: 99,
            fear: 11,
            memory_health: 88,
            mood: 'tested',
            activity: 'testing db'
        };

        await npcRepo.saveState(dummyNpc);

        // Verify by loading
        const loadedNpcs = await npcRepo.loadAll();
        assert.ok(loadedNpcs['rina'], 'Rina should exist in DB');
        assert.equal(loadedNpcs['rina'].trust, 99);
        assert.equal(loadedNpcs['rina'].memory_health, 88);
        assert.equal(loadedNpcs['rina'].mood, 'tested');
    });

    await t.test('2. WorldRepository saves and loads JSON values', async () => {
        const testKey = 'TEST_WEATHER';
        const testValue = { rain: true, intensity: 'heavy' };

        await worldRepo.saveState(testKey, testValue);

        const loadedWorld = await worldRepo.loadState();
        assert.ok(loadedWorld[testKey], 'Weather key must be loaded');
        assert.deepEqual(loadedWorld[testKey], testValue, 'JSON object must match exactly');
    });

    await t.test('3. NPCEngine integrates with Repository for Recovery', async () => {
        // Set state in DB first
        await npcRepo.saveState({
            id: 'rina',
            name: 'Rina',
            trust: 12,
            fear: 5,
            memory_health: 12,
            mood: 'amnesia',
            activity: 'bengong'
        });

        // Initialize engine (simulating bot restart)
        const bus = new EventBus();
        const engine = new NPCEngine(bus, npcRepo);
        
        await engine.init(); // This should trigger loadAll()

        assert.ok(engine.npcs['rina'], 'Rina should be loaded into Engine RAM');
        assert.equal(engine.npcs['rina'].trust, 12, 'Engine should inherit Trust from DB');
        assert.equal(engine.npcs['rina'].memory_health, 12, 'Engine should inherit Memory from DB');
    });
});
