const DomainEvents = require('../core/DomainEvents');

class BehaviorEngine {
    constructor(eventBus, npcEngine) {
        this.eventBus = eventBus;
        this.npcEngine = npcEngine;
        
        // Langganan ke WorldTick
        this.eventBus.subscribe(DomainEvents.WorldTick, this.onWorldTick.bind(this));
    }

    async onWorldTick(payload) {
        // Evaluasi jadwal semua NPC setiap kali ada state evolution atau tick.
        const tick = payload.totalTicks || 0;
        for (const npcId of Object.keys(this.npcEngine.npcs)) {
            await this.evaluateAgency(npcId, tick);
        }
    }

    async evaluateAgency(npcId, tick) {
        const npc = this.npcEngine.npcs[npcId];
        if (!npc) return;

        // Deterministic Pseudo-Random Seed
        const crypto = require('crypto');
        const seedStr = `${tick}_${npcId}_${npc.location}_movement`;
        const hash = crypto.createHash('sha256').update(seedStr).digest('hex');
        const randomVal = parseInt(hash.substring(0, 8), 16) / 0xffffffff;

        // Simulasi agency sederhana: NPC memiliki peluang 10% untuk memutuskan jalan-jalan
        if (randomVal < 0.1) {
            // NPC Decides to Move (Goal)
            const targetLocation = npc.location === 'pasar' ? 'rumah' : 'pasar';
            const activity = 'berjalan ke ' + targetLocation;
            
            // Tembakkan event keputusan (Pure, no DB persistence here)
            this.eventBus.publish(DomainEvents.NpcDecidedToMove, { 
                npc: npc.id, 
                target: targetLocation,
                activity: activity
            });
        }
    }
}

module.exports = BehaviorEngine;
