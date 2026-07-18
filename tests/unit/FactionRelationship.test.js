const test = require('node:test');
const assert = require('node:assert/strict');
const FactionRelationship = require('../../src/engine/faction/FactionRelationship');

test('FactionRelationship Domain Logic (Unit Test)', async (t) => {
    await t.test('1. Inisialisasi Default (Neutral)', () => {
        const rel = new FactionRelationship('F1', 'F2');
        assert.equal(rel.trust, 50);
        assert.equal(rel.tension, 0);
        assert.equal(rel.status, 'NEUTRAL');
    });

    await t.test('2. Transisi Neutral -> Rival', () => {
        const rel = new FactionRelationship('F1', 'F2');
        const result = rel.applyEvent(-30, +80, 'Resource Dispute');

        // trust = 20, tension = 80 -> should trigger RIVAL
        assert.equal(rel.trust, 20);
        assert.equal(rel.tension, 80);
        assert.equal(rel.status, 'RIVAL');
        assert.equal(result.statusChanged, true);
        assert.equal(result.newStatus, 'RIVAL');
    });

    await t.test('3. Transisi Neutral -> Ally', () => {
        const rel = new FactionRelationship('F1', 'F2');
        const result = rel.applyEvent(+40, +10, 'Trade Agreement');

        // trust = 90, tension = 10 -> should trigger ALLY
        assert.equal(rel.trust, 90);
        assert.equal(rel.tension, 10);
        assert.equal(rel.status, 'ALLY');
        assert.equal(result.statusChanged, true);
        assert.equal(result.newStatus, 'ALLY');
    });

    await t.test('4. Transisi Rival -> Neutral (Recovery)', () => {
        // Start as Rival (low trust, high tension)
        const rel = new FactionRelationship('F1', 'F2', { trust: 10, tension: 90, status: 'RIVAL' });
        
        // Pelan-pelan recover
        const result = rel.applyEvent(+40, -50, 'Peace Treaty');
        
        // trust = 50, tension = 40 -> back to NEUTRAL
        assert.equal(rel.trust, 50);
        assert.equal(rel.tension, 40);
        assert.equal(rel.status, 'NEUTRAL');
        assert.equal(result.statusChanged, true);
        assert.equal(result.newStatus, 'NEUTRAL');
    });
});
