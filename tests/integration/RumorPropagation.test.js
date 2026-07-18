const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');

class MockNpcRepo {
    constructor() { this.store = {}; }
    async loadAll() { return this.store; }
    async saveState(npc) { this.store[npc.id] = npc; }
}

test('Rumor Propagation: Rumor spreads through contact graph', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    npcRepo.store = {
        'npc1': { id: 'npc1', name: 'Rina', knowledge: [{ rumorId: 'rumor_harvest_1', confidence: 95 }] },
        'npc2': { id: 'npc2', name: 'Budi', knowledge: [] },
        'npc3': { id: 'npc3', name: 'Joko', knowledge: [] }
    };
    
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    const rumorEngine = new RumorEngine(eventBus);
    await npcEngine.init();

    await t.test('Contact event triggers barter', async () => {
        // npc1 bertemu npc2
        eventBus.publish('npc.metOtherNpc', { npcIdA: 'npc1', npcIdB: 'npc2' });
        
        // Wait async operations
        await new Promise(r => setTimeout(r, 20));

        assert.equal(npcRepo.store['npc2'].knowledge.length, 1, 'NPC2 seharusnya tertular rumor');
        assert.equal(npcRepo.store['npc2'].knowledge[0].rumorId, 'rumor_harvest_1');
        assert.equal(npcRepo.store['npc2'].knowledge[0].confidence, 85, 'Confidence harus berkurang akibat chinese whispers');
        
        // NPC 3 yang tidak ikut ngobrol tetap tidak tahu
        assert.equal(npcRepo.store['npc3'].knowledge.length, 0, 'NPC3 tidak boleh tahu karena tidak kontak');
    });
});
