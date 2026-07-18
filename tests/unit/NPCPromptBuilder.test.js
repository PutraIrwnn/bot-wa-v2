const test = require('node:test');
const assert = require('node:assert/strict');
const NPCPromptBuilder = require('../../src/engine/ai/NPCPromptBuilder');

test('NPCPromptBuilder Unit Test', async (t) => {
    const builder = new NPCPromptBuilder();

    await t.test('1. Angka mekanikal diterjemahkan ke semantic text', () => {
        const context = {
            npc: {
                name: 'Rina',
                trust: 90,
                memory_health: 15,
                mood: 'senang',
                activity: 'berjalan'
            },
            intent: 'talk'
        };

        const prompt = builder.build(context);
        
        assert.ok(!prompt.includes('90'), 'Angka 90 tidak boleh ada di prompt');
        assert.ok(!prompt.includes('15'), 'Angka 15 tidak boleh ada di prompt');
        assert.ok(prompt.includes('Sangat ramah'), 'Trust 90 harus diterjemahkan menjadi sangat ramah');
        assert.ok(prompt.includes('Sangat pikun'), 'Memory 15 harus diterjemahkan menjadi sangat pikun');
    });

    await t.test('2. NPC hanya mengingat rumor yang memiliki beliefScore tinggi', () => {
        const context = {
            npc: {
                name: 'Budi',
                trust: 50,
                memory_health: 100,
                mood: 'netral',
                activity: 'diam',
                beliefs: [
                    { rumorId: 'r1', rumorText: 'Pencuri di pasar!', beliefScore: 90 },
                    { rumorId: 'r2', rumorText: 'Hujan emas!', beliefScore: 30 }
                ]
            },
            intent: 'talk'
        };

        const prompt = builder.build(context);

        assert.ok(prompt.includes('Pencuri di pasar!'), 'Rumor dengan skor 90 harus dimasukkan');
        assert.ok(!prompt.includes('Hujan emas!'), 'Rumor dengan skor 30 TIDAK boleh dimasukkan');
    });
});
