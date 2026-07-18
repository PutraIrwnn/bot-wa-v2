const assert = require('node:assert');
const test = require('node:test');
const EventBus = require('../../src/engine/core/EventBus');
const ConsequenceEngine = require('../../src/engine/world/ConsequenceEngine');

test('ConsequenceEngine - Event-Driven Flow', async (t) => {
    const eventBus = new EventBus();
    const repoMock = {
        state: {},
        async loadState() { return this.state; },
        async saveState(k, v) { this.state[k] = v; }
    };

    const consequenceEngine = new ConsequenceEngine(eventBus, repoMock);

    let predictionsCorrect = 0;
    let predictionsWrong = 0;

    eventBus.subscribe('world.predictionCorrect', () => predictionsCorrect++);
    eventBus.subscribe('world.predictionWrong', () => predictionsWrong++);

    // Fire story resolved event (Correct)
    eventBus.publish('story.resolved', {
        storyId: 'story-1',
        isPredictionCorrect: true,
        actors: ['npc-1']
    });

    // Fire story resolved event (Wrong)
    eventBus.publish('story.resolved', {
        storyId: 'story-2',
        isPredictionCorrect: false,
        actors: ['npc-2']
    });

    // Give it a tiny tick for promises to resolve
    await new Promise(r => setTimeout(r, 10));

    assert.strictEqual(predictionsCorrect, 1, 'Should have 1 correct prediction evaluated');
    assert.strictEqual(predictionsWrong, 1, 'Should have 1 wrong prediction evaluated');
});
