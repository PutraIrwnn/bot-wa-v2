const fs = require('fs');
const path = require('path');
const DomainEvents = require('../core/DomainEvents');

class NPCEngine {
    /**
     * @param {Object} eventBus - Instance dari EventBus
     * @param {Object} npcRepository - Instance dari INpcRepository
     */
    constructor(eventBus, npcRepository) {
        this.eventBus = eventBus;
        this.npcRepository = npcRepository;
        this.npcs = {}; // Akan diisi saat init()
        
        this._registerListeners();
    }

    async init() {
        this.npcs = await this.npcRepository.loadAll();
        console.log(`[NPCEngine] Loaded ${Object.keys(this.npcs).length} NPCs from repository.`);
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.DayPassed, this.handleDayPassed.bind(this));
        this.eventBus.subscribe(DomainEvents.PlayerHelpedNpc, this.handlePlayerHelp.bind(this));
        this.eventBus.subscribe(DomainEvents.NpcDecidedToMove, this.handleNpcDecidedToMove.bind(this));

        // Knowledge Lifecycle (ADR-0016 & 0017)
        this.eventBus.subscribe('rumor.spread', this.handleRumorSpread.bind(this));
        this.eventBus.subscribe('rumor.decayed', this.handleRumorDecayed.bind(this));
        this.eventBus.subscribe('rumor.barterRequest', this.handleRumorBarterRequest.bind(this));
    }

    handleDayPassed(fact) {
        // Setiap hari berlalu, Memory Decay terjadi (-5%)
        for (const npcId in this.npcs) {
            const npc = this.npcs[npcId];
            npc.memory_health = Math.max(0, npc.memory_health - 5);
            console.log(`[NPCEngine] ${npc.name} memory decay: ${npc.memory_health}%`);
            
            if (npc.memory_health < 40) {
                npc.mood = 'linglung';
            }
            // Fire-and-forget async persistence
            this.npcRepository.saveState(npc).catch(err => console.error(`[NPCEngine] Error saving ${npc.id} state`, err));
        }
    }

    handlePlayerHelp(fact) {
        const npc = this.npcs[fact.npc];
        if (npc) {
            npc.trust = Math.min(100, npc.trust + 10);
            npc.memory_health = Math.min(100, npc.memory_health + 10);
            npc.mood = 'berterima kasih';
            console.log(`[NPCEngine] ${npc.name} ditolong oleh ${fact.player}. Trust: ${npc.trust}, Memory: ${npc.memory_health}`);
            // Fire-and-forget async persistence
            this.npcRepository.saveState(npc).catch(err => console.error(`[NPCEngine] Error saving ${npc.id} state`, err));
        }
    }

    handleNpcDecidedToMove(fact) {
        const npc = this.npcs[fact.npc];
        if (npc) {
            // Eksekusi pergerakan (Ubah State)
            npc.location = fact.target;
            npc.activity = fact.activity;
            
            // Fire-and-forget async persistence
            this.npcRepository.saveState(npc).then(() => {
                // Tembakkan event bahwa ia benar-benar telah bergerak
                this.eventBus.publish(DomainEvents.NpcMoved, { npc: npc.id, location: fact.target });
            }).catch(err => console.error(`[NPCEngine] Error saving ${npc.id} state`, err));
        }
    }

    handleRumorSpread(payload) {
        // payload: { rumorId, targetNpcId, confidence, sourceNpcId, originLocation, currentDay }
        const npc = this.npcs[payload.targetNpcId];
        if (npc) {
            if (!npc.knowledge) npc.knowledge = [];
            
            // Cek apakah sudah tahu
            const existing = npc.knowledge.find(k => k.rumorId === payload.rumorId);
            if (!existing) {
                npc.knowledge.push({
                    rumorId: payload.rumorId,
                    confidence: payload.confidence || 50,
                    heardFrom: payload.sourceNpcId || 'world',
                    origin: payload.originLocation || 'unknown',
                    heardDay: payload.currentDay || 1,
                    transmissionCount: payload.transmissionCount || 0
                });
                console.log(`[NPCEngine] ${npc.name} mendengarkan rumor baru: ${payload.rumorId}`);
                this.npcRepository.saveState(npc).catch(err => console.error(err));
            }
        }
    }

    handleRumorDecayed(payload) {
        // payload: { rumorId }
        // RumorEngine bilang rumor ini sudah dilupakan dunia, NPCEngine menghapusnya dari otak NPC
        for (const npcId in this.npcs) {
            const npc = this.npcs[npcId];
            if (npc.knowledge) {
                const initialLength = npc.knowledge.length;
                npc.knowledge = npc.knowledge.filter(k => k.rumorId !== payload.rumorId);
                
                if (npc.knowledge.length !== initialLength) {
                    console.log(`[NPCEngine] ${npc.name} melupakan rumor yang usang: ${payload.rumorId}`);
                    this.npcRepository.saveState(npc).catch(err => console.error(err));
                }
            }
        }
    }

    handleRumorBarterRequest(payload) {
        // payload: { npcIdA, npcIdB, currentDay }
        const npcA = this.npcs[payload.npcIdA];
        const npcB = this.npcs[payload.npcIdB];
        const currentDay = payload.currentDay || 1;

        if (npcA && npcB && npcA.knowledge && npcB.knowledge) {
            // NPC A menularkan pengetahuannya ke NPC B
            npcA.knowledge.forEach(k => {
                this.eventBus.publish('rumor.spread', {
                    rumorId: k.rumorId,
                    targetNpcId: npcB.id,
                    confidence: Math.max(10, k.confidence - 10), // Confidence turun sedikit saat diceritakan
                    sourceNpcId: npcA.id,
                    originLocation: k.origin,
                    currentDay: currentDay,
                    transmissionCount: (k.transmissionCount || 0) + 1
                });
            });

            // NPC B menularkan pengetahuannya ke NPC A
            npcB.knowledge.forEach(k => {
                this.eventBus.publish('rumor.spread', {
                    rumorId: k.rumorId,
                    targetNpcId: npcA.id,
                    confidence: Math.max(10, k.confidence - 10),
                    sourceNpcId: npcB.id,
                    originLocation: k.origin,
                    currentDay: currentDay,
                    transmissionCount: (k.transmissionCount || 0) + 1
                });
            });
        }
    }

    /**
     * Minta respon dari NPC (Fallback mode: Rule-based tanpa AI)
     * @param {string} npcId 
     * @param {string} playerMessage 
     */
    interactFallback(npcId, playerMessage) {
        const npc = this.npcs[npcId];
        if (!npc) return "NPC tidak ditemukan.";

        // 1. Cek Agency (Bisa menolak bicara)
        if (npc.activity === 'tidur') {
            return `*${npc.name} sedang tertidur pulas. Kamu tidak bisa membangunkannya.*`;
        }

        if (npc.trust < 20) {
            return `*${npc.name} menatapmu dengan dingin.* "Aku tidak ingin bicara denganmu."`;
        }

        // 2. Cek Memory Health
        if (npc.memory_health === 0) {
            return `*${npc.name} menatapmu dengan tatapan kosong.* "Maaf... siapa kamu? Aku tidak ingat pernah mengenalmu."`;
        }
        
        if (npc.memory_health < 40) {
            return `*${npc.name} terlihat memegang kepalanya yang sakit.* "Aku... kepalaku pusing... siapa tadi namamu? Ah... rasanya ada kabut di ingatanku."`;
        }

        // 3. Normal State
        return `*${npc.name} sedang ${npc.activity}.* "Halo! Ada yang bisa kubantu hari ini?"`;
    }

    /**
     * Mendapatkan prompt AI dengan Inject State
     */
    getAIPrompt(npcId, playerMessage, latestRumor = "Tidak ada rumor.") {
        const npc = this.npcs[npcId];
        if (!npc) return null;

        // Baca file template
        const templatePath = path.join(__dirname, '..', '..', 'prompts', 'npc', `${npcId}.md`);
        let prompt = fs.readFileSync(templatePath, 'utf8');

        // Inject variables
        prompt = prompt.replace('{{mood}}', npc.mood);
        prompt = prompt.replace('{{trust}}', npc.trust.toString());
        prompt = prompt.replace('{{memory_health}}', npc.memory_health.toString());
        prompt = prompt.replace('{{activity}}', npc.activity);
        prompt = prompt.replace('{{user_message}}', playerMessage);
        prompt = prompt.replace('{{latest_rumor}}', latestRumor);

        return prompt;
    }
}

module.exports = NPCEngine;
