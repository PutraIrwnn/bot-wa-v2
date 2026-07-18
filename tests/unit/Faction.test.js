const test = require('node:test');
const assert = require('node:assert/strict');
const Faction = require('../../src/engine/faction/Faction');

test('Faction Aggregate Root (Unit Test)', async (t) => {
    await t.test('1. Inisialisasi Faksi Baru', () => {
        const faction = new Faction({
            id: 'merchant_guild',
            name: 'Gilda Pedagang'
        });

        assert.equal(faction.id, 'merchant_guild');
    });

    await t.test('2. Shared Knowledge (Rumor Ownership)', () => {
        const faction = new Faction({ id: 'thieves' });
        
        assert.equal(faction.addSharedKnowledge('rumor_123'), true);
        assert.equal(faction.addSharedKnowledge('rumor_123'), false); // Duplicate dihindari
        assert.equal(faction.sharedKnowledge.length, 1);
    });
});
