const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const StoryEngine = require('../../src/engine/story/StoryEngine');
const ConsequenceEngine = require('../../src/engine/world/ConsequenceEngine');
const InMemorySnapshotRepository = require('../../src/repository/InMemorySnapshotRepository');

class MockWorldRepo {
    constructor() { this.state = {}; }
    async loadState() { return this.state; }
    async saveState(k, v) { this.state[k] = v; }
}

test('Story Causality: Story Engine derives events, Consequence Engine makes it permanent', async (t) => {
    const eventBus = new EventBus();
    const snapshotRepo = new InMemorySnapshotRepository();
    const worldRepo = new MockWorldRepo();
    
    const storyEngine = new StoryEngine(eventBus, snapshotRepo);
    const consequenceEngine = new ConsequenceEngine(eventBus, worldRepo);

    // Setup Current Snapshot with Storm
    snapshotRepo.upsertCurrentSnapshot({
        weather: 'Storm',
        market_population: 0
    });

    let storyFired = false;
    let consequenceApplied = false;

    eventBus.subscribe('story.harvestFailed', () => storyFired = true);
    eventBus.subscribe('world.consequenceApplied', (p) => {
        if (p.key === 'food_supply') consequenceApplied = true;
    });

    await t.test('State Evolution triggers Story and Consequence chains', async () => {
        // Trigger
        eventBus.publish('world.stateEvolution', { isSignificantChange: true });

        // Wait for async events
        await new Promise(r => setTimeout(r, 20));

        assert.equal(storyFired, true, 'Story Event tidak di-publish oleh StoryEngine');
        assert.equal(consequenceApplied, true, 'Consequence Engine tidak menerjemahkan Story Event menjadi World State permanen');
        assert.equal(worldRepo.state['food_supply'], 'LOW', 'World State gagal tersimpan');
    });
});
