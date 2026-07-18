const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const FactionEngine = require('../../src/engine/faction/FactionEngine');

// Mock Repositories
class MockNpcRepo {
    async loadAll() {
        return {
            'npc1': {
                id: 'npc1',
                name: 'Budi',
                trust: 50,
                memory_health: 100,
                faction_id: 'F_GUARD'
            }
        };
    }
    async saveState() {}
}

class MockFactionRepo {
    async loadAll() {
        return {
            'F_GUARD': { id: 'F_GUARD', name: 'Penjaga Kota' } // Tidak butuh domain utuh untuk tes sederhana ini
        };
    }
    async saveState() {}
}

class MockPlayerFactionRelRepo {
    constructor() {
        this.saved = [];
    }
    async loadAll() { return []; }
    async saveState(rel) {
        this.saved.push(rel);
    }
}

test('Player Faction Reputation Propagation (Integration Test)', async (t) => {
    const eventBus = new EventBus();
    
    const npcRepo = new MockNpcRepo();
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    await npcEngine.init();

    const factionRepo = new MockFactionRepo();
    const playerFactionRelRepo = new MockPlayerFactionRelRepo();
    const factionEngine = new FactionEngine(eventBus, factionRepo, playerFactionRelRepo);
    await factionEngine.init();

    await t.test('1. PlayerHelpedNpc triggers PlayerFactionInteraction and updates repo', async () => {
        let interactionEventFired = false;
        eventBus.subscribe(DomainEvents.PlayerFactionInteraction, (payload) => {
            interactionEventFired = true;
            assert.equal(payload.factionId, 'F_GUARD');
            assert.equal(payload.playerId, 'P1');
            assert.equal(payload.deltaTrust, 5); // 50% dari +10 individu
        });

        // Trigger the original interaction event (Player menolong Budi yang bagian dari F_GUARD)
        eventBus.publish(DomainEvents.PlayerHelpedNpc, {
            player: 'P1',
            npc: 'npc1',
            day: 5
        });

        // Tunggu async event handler
        await new Promise(r => setTimeout(r, 20));

        assert.equal(interactionEventFired, true, 'Event PlayerFactionInteraction harus dipancarkan oleh NPCEngine');
        
        const rel = factionEngine.playerRelations['P1_F_GUARD'];
        assert.ok(rel, 'FactionEngine harus membuat state relasi baru');
        assert.equal(rel.getTrust(), 55, 'Trust awal 50 + 5');
        assert.equal(rel.getInteractionCount(), 1);
        assert.equal(rel.getHistory()[0].day, 5, 'Histori hari harus tersimpan');

        // Verify repository interaction
        assert.equal(playerFactionRelRepo.saved.length, 1, 'Harus menyimpan ke database player-faction');
    });
});
