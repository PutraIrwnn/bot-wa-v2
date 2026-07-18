const DomainEvents = require('../core/DomainEvents');

class RumorEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.activeRumors = [];

        this._registerListeners();
    }

    _registerListeners() {
        // Event-event yang bisa menciptakan rumor
        this.eventBus.subscribe(DomainEvents.PlayerHelpedNpc, this.createHelpRumor.bind(this));
        this.eventBus.subscribe(DomainEvents.SecretDiscovered, this.createSecretRumor.bind(this));
        
        // Decay Rumor setiap hari berlalu
        this.eventBus.subscribe(DomainEvents.DayPassed, this.decayRumors.bind(this));
    }

    createHelpRumor(fact) {
        const rumor = {
            id: `rumor_${Date.now()}`,
            type: 'PLAYER_HELPED',
            player: fact.player,
            targetNPC: fact.npc,
            truthLevel: 100, // 100 = 100% Fakta
            daysAlive: 0,
            maxDays: 3, // Rumor mati dalam 3 hari
            rawText: `Seseorang melihat ${fact.player} membantu ${fact.npc}.`
        };
        this.activeRumors.push(rumor);
        console.log(`[RumorEngine] Rumor Lahir: ${rumor.rawText}`);
    }

    createSecretRumor(fact) {
        const rumor = {
            id: `rumor_${Date.now()}`,
            type: 'SECRET_DISCOVERED',
            player: fact.player,
            secretTopic: fact.topic,
            truthLevel: 80, 
            daysAlive: 0,
            maxDays: 5,
            rawText: `Kabarnya ${fact.player} mengetahui rahasia tentang ${fact.topic}.`
        };
        this.activeRumors.push(rumor);
        console.log(`[RumorEngine] Rumor Lahir: ${rumor.rawText}`);
    }

    decayRumors() {
        // Tambah umur rumor, kurangi Truth (bermutasi), hapus jika expired
        this.activeRumors = this.activeRumors.filter(r => {
            r.daysAlive += 1;
            r.truthLevel -= 15; // Semakin lama semakin hoax
            
            if (r.daysAlive >= r.maxDays) {
                console.log(`[RumorEngine] Rumor Mati (Expired): ${r.rawText}`);
                this.eventBus.publish(DomainEvents.RumorExpired, { rumorId: r.id });
                return false;
            }
            return true;
        });
        console.log(`[RumorEngine] ${this.activeRumors.length} rumor bertahan hari ini.`);
    }

    /**
     * Mengambil rumor acak dan memutasinya berdasarkan kepribadian NPC
     */
    getMutatedRumor(npcPersonality) {
        if (this.activeRumors.length === 0) return "Tidak ada rumor.";
        
        // Ambil random rumor
        const rumor = this.activeRumors[Math.floor(Math.random() * this.activeRumors.length)];
        
        // TODO: (Integrasi AI) Kirim `rumor.rawText` + `rumor.truthLevel` + `npcPersonality` ke Gemini
        // Contoh Fallback jika Gemini mati:
        if (rumor.truthLevel < 50) {
            return `*Berbisik* "Aku dengar cerita aneh tentang ${rumor.player}... tapi entahlah, kedengarannya seperti kebohongan."`;
        }
        return rumor.rawText;
    }
}

module.exports = RumorEngine;
