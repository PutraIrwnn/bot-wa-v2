const assert = require('node:assert');
const test = require('node:test');
const RelationshipPolicy = require('../../src/engine/npc/RelationshipPolicy');

test('Policy Pipeline - Conflict and Priority Resolution', (t) => {
    // Test case: Strong positive labels filtering out weak ones
    const relMock1 = {
        getDimensions: () => ({ trust: 100, affinity: 100, fear: 0, respect: 0 }),
        getHistory: () => ([{ event: 'life.saved' }]) // Adds Life Saver
    };
    
    // Evaluator will initially produce: Trusted Ally, Companion, Acquaintance, Life Saver
    const labels = RelationshipPolicy.evaluateLabels(relMock1);
    
    assert.ok(labels.includes('Trusted Ally'), 'Should have strong positive');
    assert.ok(labels.includes('Life Saver'), 'Should have history label');
    assert.ok(!labels.includes('Companion'), 'Weak positive should be filtered out by PriorityResolver');
    assert.ok(!labels.includes('Acquaintance'), 'Weak positive should be filtered out');
});
