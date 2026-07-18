const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const TrustManager = require('../../src/engine/npc/TrustManager');

class MockNpcRepo {
    constructor() { this.store = {}; }
    async loadAll() { return this.store; }
    async saveState(npc) { this.store[npc.id] = npc; }
}

test('Evidence-Based Trust: Trust only changes on verified outcomes (ADR-0019)', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    
    // NPC2 pernah mendengar rumor dari NPC1
    npcRepo.store['npc1'] = { id: 'npc1', name: 'PembawaKabar', knowledge: [], trustNetwork: {} };
    npcRepo.store['npc2'] = { 
        id: 'npc2', 
        name: 'Pendengar', 
        knowledge: [{ rumorId: 'rumor_a', heardFrom: 'npc1' }], 
        trustNetwork: { 'npc1': 50 } 
    };
    // NPC3 belum pernah interaksi
    npcRepo.store['npc3'] = { id: 'npc3', name: 'Asing', knowledge: [], trustNetwork: {} };

    const trustManager = new TrustManager(eventBus, npcRepo);

    await t.test('Correct prediction raises trust for those who heard it', async () => {
        // Trigger bukti bahwa npc1 berkata jujur (Outcome diverifikasi dunia)
        eventBus.publish('world.predictionCorrect', { originNpcId: 'npc1', factType: 'harvest' });
        
        await new Promise(r => setTimeout(r, 20));

        assert.equal(npcRepo.store['npc2'].trustNetwork['npc1'], 52, 'Trust harus bertambah +2 karena prediksi benar');
        assert.equal(npcRepo.store['npc3'].trustNetwork['npc1'], undefined, 'NPC3 tidak bertambah trustnya karena tidak pernah interaksi dengan npc1');
    });

    await t.test('Wrong prediction drops trust', async () => {
        // Trigger bukti bahwa npc1 berbohong
        eventBus.publish('world.predictionWrong', { originNpcId: 'npc1', factType: 'harvest' });
        
        await new Promise(r => setTimeout(r, 20));

        assert.equal(npcRepo.store['npc2'].trustNetwork['npc1'], 50, 'Trust harus berkurang -2 kembali ke 50');
    });
});
