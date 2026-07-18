const assert = require('node:assert');
const test = require('node:test');
const EvidenceStrength = require('../../src/engine/npc/EvidenceStrength');

test('EvidenceStrength VO - Weight and Probabilities', (t) => {
    const firstPerson = EvidenceStrength.FIRST_PERSON;
    const rumor = EvidenceStrength.RUMOR;

    assert.strictEqual(firstPerson.weight(), 1.0);
    assert.strictEqual(rumor.weight(), 0.2);
    
    assert.ok(firstPerson.decayRate() < rumor.decayRate(), 'First person should decay slower than rumor');
    assert.ok(rumor.shareProbability() > firstPerson.shareProbability() || rumor.shareProbability() > 0.8, 'Rumor should spread easily');
});
