const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');
const DiplomacyEngine = require('../../src/engine/faction/DiplomacyEngine');

class MockFactionRelRepo {
    async loadAll() {
        return [];
    }
    async saveState(rel) {}
}

test('DiplomacyEngine & World Events (Integration Test)', async (t) => {
    const eventBus = new EventBus();
    const relRepo = new MockFactionRelRepo();
    const diplomacyEngine = new DiplomacyEngine(eventBus, relRepo);

    await diplomacyEngine.init();

    await t.test('1. RESOURCE_DISPUTE creates tension and may form rivalry', async () => {
        let rivalryEventFired = false;
        eventBus.subscribe(DomainEvents.FactionRivalryFormed, () => {
            rivalryEventFired = true;
        });

        // Tembak event dunia secara bertubi-tubi sampai menembus batas Rival (tension > 75, trust < 30)
        // 1 hit: trust -15, tension +20 (trust = 35, tension = 20)
        eventBus.publish(DomainEvents.WorldEventOccurred, {
            type: 'RESOURCE_DISPUTE',
            factionA: 'F_MERCHANT',
            factionB: 'F_GUARD',
            reason: 'Rebutan tambang emas'
        });

        // 2 hit: trust 20, tension 40
        eventBus.publish(DomainEvents.WorldEventOccurred, {
            type: 'RESOURCE_DISPUTE',
            factionA: 'F_MERCHANT',
            factionB: 'F_GUARD',
            reason: 'Rebutan tambang emas lagi'
        });

        // 3 hit: trust 5, tension 60
        eventBus.publish(DomainEvents.WorldEventOccurred, {
            type: 'RESOURCE_DISPUTE',
            factionA: 'F_MERCHANT',
            factionB: 'F_GUARD',
            reason: 'Tawuran'
        });

        // 4 hit: trust 0, tension 80 -> trigger RIVAL
        eventBus.publish(DomainEvents.WorldEventOccurred, {
            type: 'RESOURCE_DISPUTE',
            factionA: 'F_MERCHANT',
            factionB: 'F_GUARD',
            reason: 'Perang'
        });

        // Beri waktu async handleWorldEvent selesai (4 promise bertumpuk di eventbus)
        await new Promise(r => setTimeout(r, 50));

        const rel = diplomacyEngine.relationships['F_MERCHANT_F_GUARD'];
        assert.ok(rel, 'Relasi harus tercipta');
        assert.equal(rel.status, 'RIVAL');
        assert.equal(rivalryEventFired, true, 'Event FactionRivalryFormed harus dipancarkan');
    });
});
