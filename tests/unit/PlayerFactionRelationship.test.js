const test = require('node:test');
const assert = require('node:assert/strict');
const PlayerFactionRelationship = require('../../src/engine/faction/PlayerFactionRelationship');

test('PlayerFactionRelationship Domain Logic (Unit Test)', async (t) => {
    await t.test('1. Inisialisasi Default', () => {
        const rel = new PlayerFactionRelationship('P1', 'F1');
        assert.equal(rel.getTrust(), 50);
        assert.equal(rel.getInteractionCount(), 0);
        assert.deepEqual(rel.getHistory(), []);
    });

    await t.test('2. Menambah histori interaksi positif', () => {
        const rel = new PlayerFactionRelationship('P1', 'F1');
        rel.applyInteraction('PLAYER_INTERACTION', +10, 'Menolong anggota faksi', 1);

        assert.equal(rel.getTrust(), 60);
        assert.equal(rel.getInteractionCount(), 1);
        
        const history = rel.getHistory();
        assert.equal(history.length, 1);
        assert.equal(history[0].event, 'PLAYER_INTERACTION');
        assert.equal(history[0].delta, 10);
        assert.equal(history[0].reason, 'Menolong anggota faksi');
        assert.equal(history[0].day, 1);
    });

    await t.test('3. Limit trust bounds (0-100)', () => {
        const rel = new PlayerFactionRelationship('P1', 'F1', { trust: 95 });
        rel.applyInteraction('PLAYER_INTERACTION', +20, 'Heroik', 2);

        assert.equal(rel.getTrust(), 100, 'Tidak boleh melebihi 100');
        
        rel.applyInteraction('PLAYER_INTERACTION', -120, 'Berkhianat', 3);
        assert.equal(rel.getTrust(), 0, 'Tidak boleh kurang dari 0');
    });
});
