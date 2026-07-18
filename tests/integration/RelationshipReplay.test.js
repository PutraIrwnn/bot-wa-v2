const assert = require('node:assert');
const test = require('node:test');
const Relationship = require('../../src/engine/npc/Relationship');
const RelationshipPolicy = require('../../src/engine/npc/RelationshipPolicy');

test('Relationship - Labels are purely derived from history and dimensions (Replay)', (t) => {
    const rel1 = new Relationship('p1', 'npc1');
    
    // Simulate events
    rel1.updateDimensions({ trust: 60, affinity: -60, fear: 10 });
    rel1.appendHistory('betrayal.detected', { trust: -40, affinity: -60, fear: 10 }, 'Betrayed at market', 'Saw him steal');
    
    // Calculate initial labels
    const labels1 = RelationshipPolicy.evaluateLabels(rel1);
    
    // Create a new relationship instance and replay dimensions and history
    const rel2 = new Relationship('p1', 'npc1');
    
    // We replay by manually setting dimensions and pushing history
    // Since history is immutable, we can safely copy it
    rel2.dimensions = rel1.getDimensions();
    rel2.history = rel1.getHistory();
    
    const labels2 = RelationshipPolicy.evaluateLabels(rel2);
    
    // Ensure labels are identical after rebuild
    assert.deepStrictEqual(labels1, labels2, 'Labels must be identical when rebuilt from dimensions and history');
    assert.ok(labels1.includes('Betrayer'), 'Should have Betrayer label from history');
});
