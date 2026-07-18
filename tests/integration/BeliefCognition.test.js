const test = require('node:test');
const assert = require('node:assert/strict');
const BeliefEngine = require('../../src/engine/npc/BeliefEngine');

class MockRumorEngine {
    getRumor(id) {
        return { id: id, credibility: 90 };
    }
}

class MockNpcRepo {
    constructor() { this.store = {}; }
    async findById(id) { return this.store[id]; }
    async saveState(npc) { this.store[npc.id] = npc; }
}

test('Belief Cognition: Knowing does not mean Believing (ADR-0018)', async (t) => {
    const npcRepo = new MockNpcRepo();
    const rumorEngine = new MockRumorEngine();
    const beliefEngine = new BeliefEngine(npcRepo, rumorEngine);
    
    npcRepo.store['npc1'] = { 
        id: 'npc1', 
        name: 'Rina', 
        knowledge: [{ rumorId: 'rumor_a', confidence: 100, heardFrom: 'pembohong' }],
        trustNetwork: { 'pembohong': 10 } // Trust sangat rendah ke pembawa gosip
    };

    npcRepo.store['npc2'] = { 
        id: 'npc2', 
        name: 'Budi', 
        knowledge: [{ rumorId: 'rumor_a', confidence: 100, heardFrom: 'sahabat' }],
        trustNetwork: { 'sahabat': 90 } // Trust tinggi ke pembawa gosip
    };

    await t.test('Belief is calculated deterministically based on Trust', async () => {
        await beliefEngine.evaluateBeliefs('npc1');
        await beliefEngine.evaluateBeliefs('npc2');
        
        const rinaBelief = npcRepo.store['npc1'].beliefs[0];
        const budiBelief = npcRepo.store['npc2'].beliefs[0];
        
        assert.equal(rinaBelief.rumorId, 'rumor_a');
        assert.equal(budiBelief.rumorId, 'rumor_a');

        // (100*0.3) + (90*0.3) + (10*0.4) = 30 + 27 + 4 = 61
        assert.equal(rinaBelief.beliefScore, 61, 'Skor Belief Rina salah');
        assert.equal(rinaBelief.certainty, 'MEDIUM', 'Certainty Rina salah');

        // (100*0.3) + (90*0.3) + (90*0.4) = 30 + 27 + 36 = 93
        assert.equal(budiBelief.beliefScore, 93, 'Skor Belief Budi salah');
        assert.equal(budiBelief.certainty, 'HIGH', 'Certainty Budi salah');
    });
});
