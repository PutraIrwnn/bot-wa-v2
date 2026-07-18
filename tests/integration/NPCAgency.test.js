const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const BehaviorEngine = require('../../src/engine/npc/BehaviorEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

class MockNpcRepo {
    async loadAll() {
        return {
            'budi': { id: 'budi', name: 'Budi', location: 'rumah', activity: 'tidur' }
        };
    }
    async saveState(npc) {}
}

test('NPC Agency: NPC Decides to Move autonomously on WorldTick', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    await npcEngine.init();

    const behaviorEngine = new BehaviorEngine(eventBus, npcEngine);
    
    // Override crypto.createHash untuk test kepastian pergerakan secara deterministik
    const crypto = require('crypto');
    const originalCreateHash = crypto.createHash;
    crypto.createHash = () => ({
        update: () => ({
            digest: () => '0000000000000000000000000000000000000000000000000000000000000000'
        })
    });

    await t.test('1. WorldTick memicu NPC Agency', async () => {
        let decidedEventFired = false;
        let movedEventFired = false;

        eventBus.subscribe(DomainEvents.NpcDecidedToMove, async (payload) => {
            if (payload.npc === 'budi') decidedEventFired = true;
        });

        eventBus.subscribe(DomainEvents.NpcMoved, async (payload) => {
            if (payload.npc === 'budi') movedEventFired = true;
        });

        // Trigger siklus waktu
        eventBus.publish(DomainEvents.WorldTick, { isPassive: false });

        // Tunggu penyelesaian event asinkron
        await new Promise(r => setTimeout(r, 20));

        // Verifikasi bahwa event ditembakkan dan state berubah
        assert.equal(decidedEventFired, true, 'Event npc.decidedToMove tidak ditembakkan');
        assert.equal(movedEventFired, true, 'Event npc.moved tidak ditembakkan');
        assert.equal(npcEngine.npcs['budi'].location, 'pasar', 'NPC gagal berpindah lokasi');
        
        crypto.createHash = originalCreateHash; // Kembalikan fungsi hash aslinya
    });
});
