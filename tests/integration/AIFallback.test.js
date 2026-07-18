const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const ActionEngine = require('../../src/engine/core/ActionEngine');
const PromptEngine = require('../../src/engine/ai/PromptEngine');
const ILLMAdapter = require('../../src/adapter/llm/ILLMAdapter');

// Mock Repositories
class MockNpcRepo {
    async loadAll() {
        return {
            'rina': { id: 'rina', name: 'Rina', trust: 50, memory_health: 100, mood: 'tenang', activity: 'idle' }
        };
    }
    async saveState(npc) {}
}

// Mock AI LLM yang selalu Timeout atau Error
class MockFailingLLM extends ILLMAdapter {
    async generateNarration(sys, user) {
        // Simulasi LLM butuh waktu 10 detik (melewati timeout 6 detik)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('LLM Timeout Simulation'));
            }, 50); // Mempercepat testing
        });
    }
}

test('AI Graceful Fallback Test (AI Failure)', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    await npcEngine.init();

    const promptEngine = new PromptEngine(new MockFailingLLM());
    const actionEngine = new ActionEngine(eventBus, npcEngine, null, promptEngine);

    await t.test('1. ActionEngine handles AI failure by serving Fallback String', async () => {
        // Timeout di PromptEngine diset ke 6 detik, untuk test ini kita override di MockFailingLLM saja
        
        const intent = { command: 'talk', args: ['rina'], player: 'player1' };
        
        // Coba trigger Action
        const result = await actionEngine.handleAction(intent);

        // Validasi output AI (Harus kembali ke statis)
        assert.ok(result.messages[0].includes('Sistem AI sedang offline'));
    });
});
