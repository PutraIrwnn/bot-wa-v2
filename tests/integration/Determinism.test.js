const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const ActionEngine = require('../../src/engine/core/ActionEngine');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

class SimulationWorld {
    constructor() {
        this.eventBus = new EventBus();
        this.mockRepo = {
            loadAll: async () => ({
                npc1: { id: 'npc1', name: 'NPC 1', trust: 50, memory_health: 100, location: 'town', faction_id: 'F_A', knowledge: [] },
                npc2: { id: 'npc2', name: 'NPC 2', trust: 50, memory_health: 100, location: 'town', faction_id: 'F_B', knowledge: [] }
            }),
            saveState: async () => {}
        };
        this.npcEngine = new NPCEngine(this.eventBus, this.mockRepo);
        this.rumorEngine = new RumorEngine(this.eventBus);
        this.actionEngine = new ActionEngine(this.eventBus, this.npcEngine, null, null, null, this.rumorEngine);
    }
    
    async init() {
        await this.npcEngine.init();
    }

    async step(tick, commandIntent) {
        this.eventBus.publish(DomainEvents.WorldTick, { totalTicks: tick });
        if (tick % 24 === 0) {
            this.eventBus.publish(DomainEvents.DayPassed, { day: Math.floor(tick / 24) });
        }
        
        if (commandIntent) {
            return await this.actionEngine.handleAction(commandIntent);
        }
        return null;
    }

    getState() {
        // Deep copy state for comparison
        return JSON.parse(JSON.stringify({
            npcs: this.npcEngine.npcs,
            rumors: Array.from(this.rumorEngine.globalRumors.entries())
        }));
    }
}

test('Determinism Verification (100 Ticks)', async (t) => {
    const worldA = new SimulationWorld();
    const worldB = new SimulationWorld();

    await worldA.init();
    await worldB.init();

    const sequence = [];
    for (let i = 1; i <= 100; i++) {
        let intent = null;
        if (i === 10) intent = { command: 'help', args: ['npc1'], player: 'p1' };
        if (i === 15) intent = { command: 'talk', args: ['npc2'], player: 'p1' };
        if (i === 24) worldA.eventBus.publish(DomainEvents.FactionRivalryFormed, { targetId: 'F_B' });
        if (i === 24) worldB.eventBus.publish(DomainEvents.FactionRivalryFormed, { targetId: 'F_B' });
        if (i === 50) intent = { command: 'rumor', args: [], player: 'p1' };
        
        sequence.push({ tick: i, intent });
    }

    let rumorResponseA = null;
    let rumorResponseB = null;

    for (const step of sequence) {
        const resA = await worldA.step(step.tick, step.intent);
        const resB = await worldB.step(step.tick, step.intent);
        
        if (step.tick === 50) {
            rumorResponseA = resA;
            rumorResponseB = resB;
        }
    }

    // Verify World State Equality
    const stateA = worldA.getState();
    const stateB = worldB.getState();

    assert.deepEqual(stateA, stateB, "Dunia harus identik setelah 100 tick dengan input sama");
    
    // Verify Rumor Shuffle Determinism Equality
    assert.deepEqual(rumorResponseA, rumorResponseB, "Shuffle rumor harus sama persis di kedua dunia");
});
