const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

class MockNpcRepo {
    constructor() { this.store = {}; }
    async loadAll() { return this.store; }
    async saveState(npc) { this.store[npc.id] = npc; }
}

test('Knowledge Ownership: Rumor Engine decays rumors, NPCEngine manages memory autonomously', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    npcRepo.store = {
        'npc1': { id: 'npc1', name: 'Rina', knowledge: [{ rumorId: 'rumor_harvest_1', confidence: 95 }] }
    };
    
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    const rumorEngine = new RumorEngine(eventBus);
    await npcEngine.init();

    // Setup decaying rumor
    rumorEngine.globalRumors.set('rumor_harvest_1', {
        id: 'rumor_harvest_1', heat: 5, lifecycleState: 'Decaying'
    });

    await t.test('Global rumor decay causes NPCEngine to autonomously erase it', async () => {
        // Trigger decay passing 1 day (24 ticks)
        eventBus.publish(DomainEvents.WorldTick, { totalTicks: 24 });
        
        await new Promise(r => setTimeout(r, 20));

        // Memastikan rumor hilang dari global
        assert.equal(rumorEngine.globalRumors.has('rumor_harvest_1'), false, 'RumorEngine gagal mendecay rumor global');
        
        // Memastikan NPCEngine menghapus memori tanpa diedit langsung oleh RumorEngine
        assert.equal(npcRepo.store['npc1'].knowledge.length, 0, 'NPCEngine gagal mematuhi ownership dan membersihkan memorinya');
    });
});
