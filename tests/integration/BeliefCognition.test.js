const test = require('node:test');
const assert = require('node:assert/strict');
const BeliefEngine = require('../../src/engine/npc/BeliefEngine');

class MockRumorEngine {
    constructor() {
        this.rumors = {
            'rumor_a': { id: 'rumor_a', credibility: 90 },
            'rumor_faction_neg': { id: 'rumor_faction_neg', credibility: 90, targetFactionId: 'F_GUARD', affinity: 'negative' },
            'rumor_faction_pos': { id: 'rumor_faction_pos', credibility: 90, targetFactionId: 'F_GUARD', affinity: 'positive' }
        };
    }
    getRumor(id) {
        return this.rumors[id];
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
        faction_id: 'F_FARMER', // Bukan F_GUARD
        knowledge: [
            { rumorId: 'rumor_a', confidence: 100, heardFrom: 'pembohong' },
            { rumorId: 'rumor_faction_neg', confidence: 100, heardFrom: 'sahabat' }
        ],
        trustNetwork: { 'pembohong': 10, 'sahabat': 90 }
    };

    npcRepo.store['npc2'] = { 
        id: 'npc2', 
        name: 'Budi', 
        faction_id: 'F_GUARD', // Anggota F_GUARD
        knowledge: [
            { rumorId: 'rumor_a', confidence: 100, heardFrom: 'sahabat' },
            { rumorId: 'rumor_faction_neg', confidence: 100, heardFrom: 'sahabat' },
            { rumorId: 'rumor_faction_pos', confidence: 100, heardFrom: 'sahabat' }
        ],
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

    await t.test('Ingroup Bias: NPC bereaksi bias terhadap rumor tentang faksinya sendiri', async () => {
        const rinaBeliefs = npcRepo.store['npc1'].beliefs;
        const budiBeliefs = npcRepo.store['npc2'].beliefs;

        const rinaNeg = rinaBeliefs.find(b => b.rumorId === 'rumor_faction_neg');
        const budiNeg = budiBeliefs.find(b => b.rumorId === 'rumor_faction_neg');
        const budiPos = budiBeliefs.find(b => b.rumorId === 'rumor_faction_pos');

        // Normal score without bias for rumor_faction_neg (heard from sahabat 90, credibility 90, conf 100) = 93
        assert.equal(rinaNeg.beliefScore, 93, 'Orang luar harus mengevaluasi rumor secara normal');

        // Budi in F_GUARD hears BAD rumor about F_GUARD. Score 93 - 30 = 63
        assert.equal(budiNeg.beliefScore, 63, 'Anggota faksi harus Denial (-30) terhadap rumor buruk tentang faksinya');
        assert.ok(budiNeg.reason.includes('Denial'), 'Reasoning harus mencantumkan Denial');

        // Budi in F_GUARD hears GOOD rumor about F_GUARD. Score 93 + 20 = 113, capped at 100
        assert.equal(budiPos.beliefScore, 100, 'Anggota faksi harus Bangga (+20) terhadap rumor baik tentang faksinya');
        assert.ok(budiPos.reason.includes('Bangga'), 'Reasoning harus mencantumkan Bangga');
    });
});
