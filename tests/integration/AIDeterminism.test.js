const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const ActionEngine = require('../../src/engine/core/ActionEngine');
const PromptEngine = require('../../src/engine/ai/PromptEngine');
const ILLMAdapter = require('../../src/adapter/llm/ILLMAdapter');
const DomainEvents = require('../../src/engine/core/DomainEvents');

// Mock Repositories
class MockNpcRepo {
    async loadAll() {
        return {
            'rina': { id: 'rina', name: 'Rina', trust: 80, memory_health: 20, mood: 'tenang', activity: 'idle' }
        };
    }
    async saveState(npc) {}
}

// Mock AI LLM yang selalu berhasil mengembalikan string "Rina tersenyum tipis."
class MockSuccessLLM extends ILLMAdapter {
    async generateNarration(sys, user) {
        return "Rina tersenyum tipis.";
    }
}

test('AI Determinism Test (State Remains Unchanged by Narration)', async (t) => {
    const eventBus = new EventBus();
    const npcRepo = new MockNpcRepo();
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    await npcEngine.init();

    const promptEngine = new PromptEngine(new MockSuccessLLM());
    const actionEngine = new ActionEngine(eventBus, npcEngine, null, promptEngine);

    await t.test('1. Talk command produces AI output but DOES NOT change state', async () => {
        // Cek state awal
        const trustSebelum = npcEngine.npcs['rina'].trust;
        const memorySebelum = npcEngine.npcs['rina'].memory_health;
        
        // Panggil talk
        const intent = { command: 'talk', args: ['rina'], player: 'player1' };
        const result = await actionEngine.handleAction(intent);

        // Validasi output AI
        assert.equal(result.messages[0], 'Rina tersenyum tipis.');

        // Validasi state (TIDAK BOLEH BERUBAH)
        assert.equal(npcEngine.npcs['rina'].trust, trustSebelum, 'Trust berubah tanpa izin!');
        assert.equal(npcEngine.npcs['rina'].memory_health, memorySebelum, 'Memory berubah tanpa izin!');
        assert.equal(result.events.length, 0, 'EventBus tidak boleh ditembak oleh AI saat talk biasa');
    });

    await t.test('2. Help command changes state ONLY because Rule Engine decides, not AI', async () => {
        const trustSebelum = npcEngine.npcs['rina'].trust;
        
        const intent = { command: 'help', args: ['rina'], player: 'player1' };
        const result = await actionEngine.handleAction(intent);

        // Validasi output AI
        assert.equal(result.messages[0], 'Rina tersenyum tipis.');

        // Tunggu event propagasi
        await new Promise(r => setTimeout(r, 10));

        // State harus berubah HANYA karena ActionEngine melempar PlayerHelpedNpc
        assert.ok(npcEngine.npcs['rina'].trust > trustSebelum, 'Trust tidak bertambah');
        assert.equal(result.events[0], DomainEvents.PlayerHelpedNpc);
    });
});
