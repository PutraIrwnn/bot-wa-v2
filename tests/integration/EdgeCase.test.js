const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const FactionEngine = require('../../src/engine/faction/FactionEngine');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

test('Edge Case Testing', async (t) => {
    const eventBus = new EventBus();
    
    // Mock repositories
    const mockNpcRepo = { loadAll: async () => ({}), saveState: async () => {} };
    const mockFactionRepo = { loadAll: async () => ({}) };
    const mockPlayerFactionRepo = { loadAll: async () => ([]), saveState: async () => {} };

    const npcEngine = new NPCEngine(eventBus, mockNpcRepo);
    const factionEngine = new FactionEngine(eventBus, mockFactionRepo, mockPlayerFactionRepo);
    const rumorEngine = new RumorEngine(eventBus);

    await t.test('1. NPC without faction does not crash PlayerHelpedNpc', async () => {
        npcEngine.npcs['loner'] = { id: 'loner', name: 'Loner', trust: 50, memory_health: 100, faction_id: null };
        assert.doesNotThrow(() => {
            eventBus.publish(DomainEvents.PlayerHelpedNpc, { player: 'p1', npc: 'loner' });
        });
        assert.equal(npcEngine.npcs['loner'].trust, 60);
    });

    await t.test('2. Faction with 0 members handles interaction safely', async () => {
        // NPCEngine thinks the NPC is in 'EMPTY_FAC', but the faction doesn't exist in FactionEngine
        npcEngine.npcs['ghost'] = { id: 'ghost', name: 'Ghost', trust: 50, memory_health: 100, faction_id: 'EMPTY_FAC' };
        // We assert it doesn't crash when passing undefined faction
        assert.doesNotThrow(() => {
            eventBus.publish(DomainEvents.PlayerHelpedNpc, { player: 'p1', npc: 'ghost' });
        });
        await new Promise(setImmediate); // allow event loop to process interaction
        assert.ok(true);
    });

    await t.test('3. Thousands of rumors expiring concurrently', async () => {
        for (let i = 0; i < 2000; i++) {
            rumorEngine.createFactionRumor('F1', 'neutral', `Rumor ${i}`);
        }
        // Force decay to threshold
        for (const [id, rumor] of rumorEngine.globalRumors.entries()) {
            rumor.heat = 5; // will decay in next tick
        }
        
        assert.doesNotThrow(() => {
            eventBus.publish(DomainEvents.WorldTick, { totalTicks: 24 });
        });
        
        assert.equal(rumorEngine.globalRumors.size, 0); // all decayed concurrently
    });

    await t.test('4. Multiple identical events in one tick', async () => {
        eventBus.publish(DomainEvents.WorldTick, { totalTicks: 100 });
        rumorEngine.createFactionRumor('F_X', 'negative', 'Same Event');
        rumorEngine.createFactionRumor('F_X', 'negative', 'Same Event');
        rumorEngine.createFactionRumor('F_X', 'negative', 'Same Event');
        
        const active = Array.from(rumorEngine.globalRumors.values());
        // Identical text, faction, and tick will produce the same textHash and tick,
        // resulting in the same rumor ID. This effectively deduplicates identical events.
        const uniqueIds = new Set(active.map(r => r.id));
        assert.equal(uniqueIds.size, 1);
    });

    await t.test('5. NPC losing all belief/memory', async () => {
        npcEngine.npcs['amnesia'] = { id: 'amnesia', name: 'Amnesia', trust: 50, memory_health: 5 };
        eventBus.publish(DomainEvents.DayPassed, { day: 2 });
        assert.equal(npcEngine.npcs['amnesia'].memory_health, 0);
        assert.equal(npcEngine.npcs['amnesia'].mood, 'linglung');
        
        // Ensure interaction fallback handles memory = 0
        const reply = npcEngine.interactFallback('amnesia', 'hello');
        assert.ok(reply.includes('kosong')); // menatapmu dengan tatapan kosong
    });
});
