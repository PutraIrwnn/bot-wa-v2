const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');

test('RumorEngine Unit Test', async (t) => {
    const eventBus = new EventBus();
    const rumorEngine = new RumorEngine(eventBus);

    await t.test('1. FactionRivalryFormed creates a negative faction rumor', () => {
        eventBus.publish(DomainEvents.FactionRivalryFormed, {
            sourceId: 'F_GUARD',
            targetId: 'F_THIEVES',
            reason: 'perebutan wilayah'
        });

        const activeRumors = Array.from(rumorEngine.globalRumors.values());
        assert.equal(activeRumors.length, 1);
        
        const rumor = activeRumors[0];
        assert.equal(rumor.originEvent, 'FACTION_RELATION');
        assert.equal(rumor.targetFactionId, 'F_THIEVES');
        assert.equal(rumor.affinity, 'negative');
        assert.equal(rumor.credibility, 90);
        assert.ok(rumor.rawText.includes('mulai bermusuhan'));
    });

    await t.test('2. FactionAllianceFormed creates a positive faction rumor', () => {
        eventBus.publish(DomainEvents.FactionAllianceFormed, {
            sourceId: 'F_GUARD',
            targetId: 'F_MERCHANT'
        });

        const activeRumors = Array.from(rumorEngine.globalRumors.values());
        assert.equal(activeRumors.length, 2);
        
        const rumor = activeRumors[1];
        assert.equal(rumor.originEvent, 'FACTION_RELATION');
        assert.equal(rumor.targetFactionId, 'F_MERCHANT');
        assert.equal(rumor.affinity, 'positive');
        assert.equal(rumor.credibility, 90);
        assert.ok(rumor.rawText.includes('menjalin aliansi baru'));
    });

    await t.test('3. Tick 0 Cold-start does not produce collision', () => {
        // Asumsikan server baru direstart, tick belum ter-set
        const localEventBus = new EventBus();
        const coldEngine = new RumorEngine(localEventBus);
        
        // Buat dua rumor di tick 0 (undefined currentTick) untuk faksi yang sama dengan teks identik
        coldEngine.createFactionRumor('F_TEST', 'neutral', 'Text Sama');
        coldEngine.createFactionRumor('F_TEST', 'neutral', 'Text Sama');
        
        const rumors = Array.from(coldEngine.globalRumors.values());
        assert.equal(rumors.length, 2);
        assert.notEqual(rumors[0].id, rumors[1].id, 'Rumor IDs should not collide at tick 0');
    });
});
