const EventBus = require('./src/engine/core/EventBus');
const DomainEvents = require('./src/engine/core/DomainEvents');
const NPCEngine = require('./src/engine/npc/NPCEngine');
const ExploreEngine = require('./src/engine/core/ExploreEngine');
const RumorEngine = require('./src/engine/core/RumorEngine');
const StoryEngine = require('./src/engine/core/StoryEngine');

// 1. Dependency Injection: Event Bus is the core
const eventBus = new EventBus();

// --- PROOF OF FAILURE ISOLATION ---
eventBus.subscribe(DomainEvents.PlayerHelpedNpc, () => {
    console.log('[FaultyEngine] Menerima event PLAYER_HELPED_NPC tapi saya akan crash!');
    throw new Error('Simulated Crash from FaultyEngine!');
});

// 2. Engines Instantiation
const npcEngine = new NPCEngine(eventBus);
const exploreEngine = new ExploreEngine(eventBus, npcEngine);
const rumorEngine = new RumorEngine(eventBus);
const storyEngine = new StoryEngine(eventBus);

console.log('🌍 AETHERIA: LIVING WORLD SIMULATION TEST\n');

// --- SIMULASI DAY 1 ---
console.log('=== DAY 1 ===');
console.log(exploreEngine.explore('toko_bunga'));
console.log('Action: Player menolong Rina');
eventBus.publish(DomainEvents.PlayerHelpedNpc, { player: 'Putra', npc: 'rina' });
console.log('Action: Player menemukan kalung aneh');
eventBus.publish(DomainEvents.SecretDiscovered, { player: 'Putra', topic: 'kalung berlogo Echoes' });

// --- SIMULASI DAY 2 ---
console.log('\n=== DAY 2 ===');
eventBus.publish(DomainEvents.DayPassed);
console.log(exploreEngine.explore('toko_bunga'));
console.log('NPC Gossip:', rumorEngine.getMutatedRumor('sirik'));

// --- SIMULASI DAY 3 (Prologue Unlocks) ---
console.log('\n=== DAY 3 ===');
eventBus.publish(DomainEvents.DayPassed);

// --- SIMULASI LAMA (DAY 4 - 20): Pemain Menghilang ---
console.log('\n=== LAMA TIDAK ADA PEMAIN (DAY 4 - 20) ===');
for(let i=0; i<17; i++) {
    eventBus.publish(DomainEvents.DayPassed);
}

// Check State
setTimeout(() => {
    console.log('\n=== KONDISI DUNIA SAAT INI ===');
    console.log(exploreEngine.explore('toko_bunga'));
    console.log('\nFallback Chat Rina:', npcEngine.interactFallback('rina', 'Halo?'));
    console.log('\nRumor tersisa:', rumorEngine.activeRumors.length);
}, 200);
