/**
 * TrustManager
 * Menangani evaluasi Trust (Reputasi) antar-NPC.
 * DILARANG KERAS membaca/mengeksekusi Rumor secara langsung. 
 * Hanya merespons Verified Outcomes (Evidence).
 */
class TrustManager {
    constructor(eventBus, npcRepository) {
        this.eventBus = eventBus;
        this.npcRepository = npcRepository;

        // Mendengarkan Verified Evidence dari Consequence Engine atau World Engine
        this.eventBus.subscribe('world.predictionCorrect', this.onPredictionCorrect.bind(this));
        this.eventBus.subscribe('world.predictionWrong', this.onPredictionWrong.bind(this));
    }

    async onPredictionCorrect(payload) {
        // payload: { originNpcId, factType }
        console.log(`[TrustManager] Validasi kebenaran dari ${payload.originNpcId}. Meningkatkan reputasi.`);
        await this._updateReputation(payload.originNpcId, +2);
    }

    async onPredictionWrong(payload) {
        // payload: { originNpcId, factType }
        console.log(`[TrustManager] ${payload.originNpcId} berbohong/salah prediksi. Menurunkan reputasi.`);
        await this._updateReputation(payload.originNpcId, -2);
    }

    async _updateReputation(sourceNpcId, modifier) {
        const npcs = await this.npcRepository.loadAll();
        for (const id in npcs) {
            const npc = npcs[id];
            if (id === sourceNpcId) continue;
            
            // Cek apakah NPC ini pernah mendengar sesuatu dari sourceNpcId
            const hasHeardFromSource = npc.knowledge && npc.knowledge.some(k => k.heardFrom === sourceNpcId);
            
            if (hasHeardFromSource) {
                if (!npc.trustNetwork) npc.trustNetwork = {};
                let currentTrust = npc.trustNetwork[sourceNpcId] || 50;
                
                npc.trustNetwork[sourceNpcId] = Math.min(100, Math.max(0, currentTrust + modifier));
                this.npcRepository.saveState(npc).catch(err => console.error(err));
            }
        }
    }
}

module.exports = TrustManager;
