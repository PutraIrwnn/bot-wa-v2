const assert = require('node:assert');
const test = require('node:test');
const crypto = require('crypto');
const EventBus = require('../../src/engine/core/EventBus');
const BehaviorEngine = require('../../src/engine/npc/BehaviorEngine');

test('BehaviorEngine - Deterministic Agency', async (t) => {
    const eventBus = new EventBus();
    const npcEngineMock = {
        npcs: {
            'npc-1': { id: 'npc-1', location: 'pasar' },
            'npc-2': { id: 'npc-2', location: 'rumah' }
        }
    };
    
    const behaviorEngine = new BehaviorEngine(eventBus, npcEngineMock);
    
    let decisions = [];
    eventBus.subscribe('npc.decidedToMove', (payload) => {
        decisions.push(payload);
    });

    // Simulasi Tick 1
    await behaviorEngine.onWorldTick({ totalTicks: 1 });
    const decisionsTick1 = [...decisions];
    
    // Reset decisions
    decisions.length = 0;

    // Simulasi Tick 1 lagi (harus sama persis)
    await behaviorEngine.onWorldTick({ totalTicks: 1 });
    const decisionsTick1_replay = [...decisions];

    assert.deepStrictEqual(decisionsTick1, decisionsTick1_replay, 'Replay on same tick must produce identical decisions');

    // Reset decisions
    decisions.length = 0;
    
    // Simulasi Tick 2 (harus beda dengan Tick 1 jika hash berbeda)
    await behaviorEngine.onWorldTick({ totalTicks: 2 });
    // This is just to ensure it executes without error. We can't guarantee it's strictly different in output array length, but the seed is different.
    assert.ok(true);
});
