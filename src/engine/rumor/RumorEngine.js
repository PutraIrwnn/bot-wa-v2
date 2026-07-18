const RumorDTO = require('./RumorDTO');
const DomainEvents = require('../core/DomainEvents');

/**
 * RumorEngine
 * Mengelola siklus hidup rumor global (Heat, Credibility, Decay).
 * Ia menembakkan event transfer ketika ada pergerakan/interaksi NPC,
 * namun ia DILARANG KERAS mengedit memori NPC secara langsung.
 */
class RumorEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.globalRumors = new Map(); // id -> RumorDTO
        
        // Listen to Story Events to create Rumors
        this.eventBus.subscribe('story.marketBusy', (p) => this.onCreateRumor('story.marketBusy', p));
        this.eventBus.subscribe('story.harvestFailed', (p) => this.onCreateRumor('story.harvestFailed', p));

        // Faction Events (Sprint 15 / 16 Consolidation)
        this.eventBus.subscribe(DomainEvents.FactionRivalryFormed, this.handleFactionRivalry.bind(this));
        this.eventBus.subscribe(DomainEvents.FactionAllianceFormed, this.handleFactionAlliance.bind(this));

        // Listen to World Tick for Decay
        this.eventBus.subscribe(DomainEvents.WorldTick, this.onWorldTick.bind(this));

        // Listen to Contact for Spread (Propagation)
        this.eventBus.subscribe('npc.metOtherNpc', this.onNpcMet.bind(this));
    }

    onCreateRumor(eventType, payload) {
        if (this.currentTick === undefined || this.currentTick === 0) {
            this._tick0Counter = (this._tick0Counter || 0) + 1;
        }
        const tick = this.currentTick || 0;
        const tickSuffix = (tick === 0) ? `_0_${this._tick0Counter}` : `_${tick}`;
        
        const crypto = require('crypto');
        const locHash = crypto.createHash('md5').update(payload.location || 'unknown').digest('hex').substring(0, 4);
        const rumorId = `rumor_${eventType}${tickSuffix}_${locHash}`;
        
        const rumor = new RumorDTO({
            id: rumorId,
            originEvent: eventType,
            originLocation: payload.location || 'unknown',
            createdDay: payload.day || 1, // simplifikasi
            heat: 100, // Sangat viral saat baru lahir
            credibility: eventType.includes('harvest') ? 95 : 40 
        });

        this.globalRumors.set(rumor.id, rumor);
        
        // Inject ke NPC pertama (Origin NPC) - Misal kita publish event agar NPCEngine menangkap
        // Tapi jika belum ada Origin spesifik, kita biarkan spread pasif
        if (payload.originNpcId) {
            this.eventBus.publish('rumor.spread', {
                rumorId: rumor.id,
                targetNpcId: payload.originNpcId,
                confidence: rumor.credibility
            });
        }
    }

    handleFactionRivalry(fact) {
        this.createFactionRumor(fact.targetId, 'negative', `Kudengar faksi ${fact.targetId} mulai bermusuhan karena ${fact.reason || 'perebutan kekuasaan'}.`);
    }

    handleFactionAlliance(fact) {
        this.createFactionRumor(fact.targetId, 'positive', `Kudengar faksi ${fact.targetId} menjalin aliansi baru.`);
    }

    createFactionRumor(targetFactionId, affinity, rawText) {
        if (this.currentTick === undefined || this.currentTick === 0) {
            this._tick0Counter = (this._tick0Counter || 0) + 1;
        }
        const tick = this.currentTick || 0;
        const tickSuffix = (tick === 0) ? `_0_${this._tick0Counter}` : `_${tick}`;
        
        // Gunakan Hash dari rawText untuk menghindari duplicate ID jika ada 2 rumor di tick yang sama
        const crypto = require('crypto');
        const textHash = crypto.createHash('md5').update(rawText).digest('hex').substring(0, 4);
        const rumorId = `rumor_fac_${targetFactionId}${tickSuffix}_${textHash}`;
        const rumor = new RumorDTO({
            id: rumorId,
            originEvent: 'FACTION_RELATION',
            originLocation: 'unknown',
            createdDay: 1, 
            heat: 100, 
            credibility: 90,
            targetFactionId: targetFactionId,
            affinity: affinity,
            rawText: rawText
        });
        this.globalRumors.set(rumor.id, rumor);
        console.log(`[RumorEngine] Rumor Faksi Lahir: ${rumor.rawText}`);
    }

    onWorldTick(payload) {
        const tickCount = payload.totalTicks || 0;
        this.currentTick = tickCount; // Simpan untuk deterministic ID generation
        
        // Misalkan setiap 24 tick (1 hari) rumor decay sebesar 10
        if (tickCount > 0 && tickCount % 24 === 0) {
            for (const [id, rumor] of this.globalRumors.entries()) {
                rumor.heat -= 10;

                if (rumor.heat <= 0) {
                    rumor.lifecycleState = 'Forgotten';
                    this.globalRumors.delete(id);
                    
                    // RumorEngine memberi tahu bahwa rumor ini mati
                    this.eventBus.publish('rumor.decayed', { rumorId: id });
                } else if (rumor.heat < 30) {
                    rumor.lifecycleState = 'Decaying';
                }
            }
        }
    }

    onNpcMet(payload) {
        // payload = { npcIdA, npcIdB, location }
        // Kita simulasikan pertukaran rumor berdasarkan Contact Graph
        // Untuk Sprint 9, NPCEngine merespons event ini untuk memeriksa memorinya
        // RumorEngine bertugas menghitung apakah suatu rumor layak disebarkan 
        
        // Agar benar-benar memisahkan tanggung jawab, 'npc.metOtherNpc' sebenarnya sudah cukup.
        // Kita bisa asumsikan NPCEngine (atau modul SpreadManager khusus) menangani barter rumor
        // Tetapi demi terpusatnya Rumor Propagation, mari kita lepaskan event `rumor.spreadAttempt`
        
        // Disini kita broadcast agar NPCEngine me-request barter rumor
        this.eventBus.publish('rumor.barterRequest', {
            npcIdA: payload.npcIdA,
            npcIdB: payload.npcIdB
        });
    }

    // Dipanggil oleh NPCEngine saat barter (request global rumor info)
    getRumor(id) {
        return this.globalRumors.get(id);
    }
}

module.exports = RumorEngine;
