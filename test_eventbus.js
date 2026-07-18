const EventBus = require('./src/engine/core/EventBus');
const DomainEvents = require('./src/engine/core/DomainEvents');

// Dependency Injection: Instantiate bus
const eventBus = new EventBus();

console.log('🧪 Testing Event Bus...\n');

// 1. NPC Engine Listener (menerima event tanpa kenal siapa yang trigger)
const unsubscribeNPC = eventBus.subscribe(DomainEvents.PlayerHelpedNpc, (fact) => {
    console.log(`[NPC Engine] Menerima fakta: Player ${fact.player} menolong ${fact.npc}.`);
    console.log(`[NPC Engine] Menaikkan Trust ${fact.npc} sebesar +10.\n`);
});

// 2. Rumor Engine Listener
eventBus.subscribe(DomainEvents.PlayerHelpedNpc, (fact) => {
    console.log(`[Rumor Engine] Menerima fakta: Player ${fact.player} menolong ${fact.npc}.`);
    console.log(`[Rumor Engine] Membuat Rumor baru: "Seseorang melihat ${fact.player} di dekat toko ${fact.npc}."\n`);
});

// 3. Trigger Event (Misal dari ActionEngine / Explore)
console.log('--- Action: Putra menolong Rina ---\n');
eventBus.publish(DomainEvents.PlayerHelpedNpc, {
    type: 'PLAYER_HELPED',
    player: 'Putra',
    npc: 'Rina'
});

// Tunggu sebentar untuk memastikan promise resolve
setTimeout(() => {
    console.log('--- Action: Unsubscribe NPC Engine & Trigger lagi ---\n');
    unsubscribeNPC();
    
    eventBus.publish(DomainEvents.PlayerHelpedNpc, {
        type: 'PLAYER_HELPED',
        player: 'Putra',
        npc: 'Gareth'
    });
}, 100);
