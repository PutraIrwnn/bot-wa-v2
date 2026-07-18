const EventBus = require('./src/engine/core/EventBus');
const DomainEvents = require('./src/engine/core/DomainEvents');
const NPCEngine = require('./src/engine/npc/NPCEngine');

const eventBus = new EventBus();
const npcEngine = new NPCEngine(eventBus);

console.log('🧪 Testing NPC Fallback & AI Prompt Injection\n');

// 1. Normal Interaction (Fallback)
console.log('--- Interaksi Normal ---');
console.log(npcEngine.interactFallback('rina', 'Halo rina!'));

// 2. Simulate Memory Decay (Day Passed)
console.log('\n--- Simulate 13 Days Passed (-65% Memory) ---');
for(let i=0; i<13; i++) {
    eventBus.publish(DomainEvents.DayPassed);
}

setTimeout(() => {
    console.log('\n--- Interaksi Setelah Memory Decay ---');
    console.log(npcEngine.interactFallback('rina', 'Rina, kamu tidak apa-apa?'));

    // 3. Simulate Total Amnesia
    console.log('\n--- Simulate Total Amnesia (Memory 0%) ---');
    for(let i=0; i<10; i++) {
        eventBus.publish(DomainEvents.DayPassed);
    }
    
    setTimeout(() => {
        console.log('\n--- Interaksi Total Amnesia ---');
        console.log(npcEngine.interactFallback('rina', 'Rina ini aku...'));

        // 4. Simulate Night Time (Sleeping)
        console.log('\n--- Simulate Night Time (Activity Change) ---');
        npcEngine.npcs['rina'].activity = 'tidur';
        console.log(npcEngine.interactFallback('rina', 'Rina bangun!'));

        // 5. Test AI Prompt Injection
        console.log('\n--- Test Generated AI Prompt (dikirim ke Gemini) ---');
        const prompt = npcEngine.getAIPrompt('rina', 'Rina bangun!', 'Tidak ada rumor.');
        console.log(prompt);
        
    }, 100);

}, 100);
