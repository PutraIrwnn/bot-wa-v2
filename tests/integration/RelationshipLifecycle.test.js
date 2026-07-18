const assert = require('node:assert');
const test = require('node:test');
const EventBus = require('../../src/engine/core/EventBus');
const RelationshipEngine = require('../../src/engine/npc/RelationshipEngine');
const RelationshipLifecycleService = require('../../src/engine/npc/RelationshipLifecycleService');

test('RelationshipLifecycle - Active Decay on DayPassed', async (t) => {
    const eventBus = new EventBus();
    const relEngine = new RelationshipEngine(eventBus);
    const lifecycle = new RelationshipLifecycleService(eventBus, relEngine);

    // Initial setup day 0
    const rel = relEngine.getRelationship('p1', 'npc1');
    rel.updateDimensions({ trust: 100 });
    rel.appendHistory('test.event', { trust: 100 }, 'Test', null, 0); // lastInteractionDay = 0
    
    assert.strictEqual(rel.status, 'ACTIVE');

    // Simulate day 15 (no decay yet since threshold is 30)
    await lifecycle.onDayPassed({ day: 15 });
    assert.strictEqual(rel.status, 'ACTIVE');
    assert.strictEqual(rel.getDimensions().trust, 100);

    let decayedFired = false;
    eventBus.subscribe('relationship.decayed', () => { decayedFired = true; });

    // Simulate day 31 (exceeds 30)
    await lifecycle.onDayPassed({ day: 31 });
    assert.strictEqual(rel.status, 'DORMANT');
    assert.strictEqual(rel.getDimensions().trust, 50, 'Trust should decay by half');
    assert.ok(decayedFired, 'Event should be fired');
});
