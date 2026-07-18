const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const FactionEngine = require('../../src/engine/faction/FactionEngine');
const PropagationEngine = require('../../src/engine/faction/PropagationEngine');
const Faction = require('../../src/engine/faction/Faction');

// Mocks
class MockFactionRepo {
    async loadAll() {
        return {
            'guild_a': new Faction({ id: 'guild_a', name: 'Guild A' })
        };
    }
    async saveState(faction) {}
}

class MockNpcRepo {
    async loadAll() {
        return {
            // NPC Penakut (fear > 30)
            'npc1': { id: 'npc1', name: 'Penakut', trust: 50, fear: 80, faction_id: 'guild_a' },
            // NPC Pemberani (fear <= 30)
            'npc2': { id: 'npc2', name: 'Pemberani', trust: 50, fear: 10, faction_id: 'guild_a' },
            // NPC Bukan Anggota Faksi
            'npc3': { id: 'npc3', name: 'Orang Luar', trust: 50, fear: 10, faction_id: null }
        };
    }
    async saveState(npc) {}
}

test('Faction Agency & Propagation (Integration Test)', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    const factionRepo = new MockFactionRepo();

    const npcEngine = new NPCEngine(eventBus, npcRepo);
    const factionEngine = new FactionEngine(eventBus, factionRepo);
    const propagationEngine = new PropagationEngine(eventBus, npcEngine);

    await npcEngine.init();
    await factionEngine.init();

    await t.test('1. Faction Reputation Change Propagates Asymmetrically', async () => {
        const initialTrustNpc1 = npcEngine.npcs['npc1'].trust;
        const initialTrustNpc2 = npcEngine.npcs['npc2'].trust;
        const initialTrustNpc3 = npcEngine.npcs['npc3'].trust;

        // Player menaikkan reputasi faksi sebesar 20
        eventBus.publish(DomainEvents.PlayerFactionInteraction, {
            factionId: 'guild_a',
            playerId: 'player1',
            deltaTrust: 20,
            reason: 'Menyumbang emas'
        });

        // Tunggu propagation async selesai
        await new Promise(r => setTimeout(r, 20));

        // NPC 1 (Penakut) harusnya bereaksi lebih lambat terhadap kenaikan trust (0.25x = +5)
        assert.equal(npcEngine.npcs['npc1'].trust, initialTrustNpc1 + 5);

        // NPC 2 (Pemberani) harusnya bereaksi lebih cepat terhadap kenaikan trust (0.60x = +12)
        assert.equal(npcEngine.npcs['npc2'].trust, initialTrustNpc2 + 12);

        // NPC 3 (Orang luar) tidak terpengaruh
        assert.equal(npcEngine.npcs['npc3'].trust, initialTrustNpc3);
    });
});
