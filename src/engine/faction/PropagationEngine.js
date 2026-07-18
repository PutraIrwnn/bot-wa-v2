const DomainEvents = require('../core/DomainEvents');

/**
 * PropagationEngine
 * Bertugas menyebarkan perubahan reputasi Faksi kepada individu anggota faksi.
 * Memiliki kalkulasi penyebaran yang asimetris berdasarkan "trait" NPC.
 */
class PropagationEngine {
    constructor(eventBus, npcEngine) {
        this.eventBus = eventBus;
        this.npcEngine = npcEngine;

        this._registerListeners();
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.PlayerFactionInteraction, this.handlePropagation.bind(this));
    }

    async handlePropagation(payload) {
        const { factionId, deltaTrust } = payload;

        // Iterasi semua NPC, cari yang menjadi anggota faksi ini
        for (const npcId in this.npcEngine.npcs) {
            const npc = this.npcEngine.npcs[npcId];
            
            if (npc.faction_id === factionId) {
                // Done Definition: Kalkulasi Asimetris Deterministik
                // Kita gunakan trait imajiner untuk contoh deterministik asimetris:
                // Jika NPC memiliki fear yang sudah tinggi (>30), kita anggap dia 'penakut'.
                // Jika fear rendah (<=30), dia 'pemberani'.
                
                let trustDelta = 0;
                let fearDelta = 0;

                const isCoward = npc.fear > 30;

                if (deltaTrust > 0) {
                    if (isCoward) {
                        trustDelta = Math.floor(deltaTrust * 0.25); // Penakut sulit percaya
                    } else {
                        trustDelta = Math.floor(deltaTrust * 0.60); // Pemberani lebih reaktif
                    }
                } else if (deltaTrust < 0) {
                    if (isCoward) {
                        fearDelta = Math.floor(Math.abs(deltaTrust) * 0.50); // Penakut cepat takut
                        trustDelta = deltaTrust; // trust turun penuh
                    } else {
                        fearDelta = Math.floor(Math.abs(deltaTrust) * 0.10); // Pemberani jarang takut
                        trustDelta = Math.floor(deltaTrust * 0.60); 
                    }
                }

                npc.trust = Math.max(0, Math.min(100, npc.trust + trustDelta));
                npc.fear = Math.max(0, Math.min(100, npc.fear + fearDelta));

                // Save ke NPC Repo (menggunakan method di NPCEngine kelak, tapi krn ini simulasi ram)
                try {
                    await this.npcEngine.npcRepository.saveState(npc);
                } catch (e) {
                    // Log error if any
                }
            }
        }
    }
}

module.exports = PropagationEngine;
