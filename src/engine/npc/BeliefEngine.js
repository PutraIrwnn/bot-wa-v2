const NPCBelief = require('./NPCBelief');

/**
 * BeliefEngine
 * Mengevaluasi NPCKnowledge menjadi NPCBelief berdasarkan level Trust.
 * DILARANG KERAS mengubah Trust NPC. Hanya membaca Trust.
 */
class BeliefEngine {
    constructor(npcRepository, rumorEngine) {
        this.npcRepository = npcRepository;
        this.rumorEngine = rumorEngine; // Hanya untuk baca kredibilitas rumor
    }

    /**
     * @param {string} npcId
     */
    async evaluateBeliefs(npcId) {
        const npc = await this.npcRepository.findById(npcId);
        if (!npc || !npc.knowledge) return;

        if (!npc.beliefs) npc.beliefs = [];
        if (!npc.trustNetwork) npc.trustNetwork = {}; // sourceNpcId -> trustScore (0-100)

        for (const k of npc.knowledge) {
            // Dapatkan Rumor Global (Jika sudah decay/hilang, jangan evaluasi)
            const globalRumor = this.rumorEngine.getRumor(k.rumorId);
            if (!globalRumor) continue;

            // Cek trust pada sumber
            const sourceTrust = npc.trustNetwork[k.heardFrom] || 50; // Default Netral

            let affiliationBias = 0;
            let biasReason = '';

            // Sprint 15: Ingroup Bias (Affiliation Bias)
            if (globalRumor.targetFactionId && npc.faction_id === globalRumor.targetFactionId) {
                if (globalRumor.affinity === 'negative') {
                    affiliationBias = -30; // Denial
                    biasReason = ' (Denial: Menolak percaya hal buruk tentang faksinya sendiri)';
                } else if (globalRumor.affinity === 'positive') {
                    affiliationBias = 20; // Ingroup favoritism
                    biasReason = ' (Bangga: Sangat percaya hal baik tentang faksinya sendiri)';
                }
            }

            // Kalkulasi deterministik BeliefScore
            // Faktor: Kepercayaan (Confidence k), Kredibilitas Isu (Credibility), Trust ke pembawa berita, dan Affiliation Bias.
            let score = (k.confidence * 0.3) + (globalRumor.credibility * 0.3) + (sourceTrust * 0.4) + affiliationBias;
            score = Math.min(100, Math.max(0, Math.floor(score)));

            let certainty = 'LOW';
            if (score > 80) certainty = 'HIGH';
            else if (score > 40) certainty = 'MEDIUM';

            const baseReason = sourceTrust > 70 
                ? `Sangat percaya karena bersumber dari ${k.heardFrom}.` 
                : (sourceTrust < 30 ? `Meragukan karena ${k.heardFrom} pembohong.` : `Mengevaluasi secara objektif.`);
            
            const reason = baseReason + biasReason;

            // Cari apakah sudah punya belief ini
            const existingIdx = npc.beliefs.findIndex(b => b.rumorId === k.rumorId);
            const newBelief = new NPCBelief({
                rumorId: k.rumorId,
                beliefScore: score,
                certainty: certainty,
                reason: reason,
                lastEvaluated: Date.now()
            });

            if (existingIdx >= 0) {
                npc.beliefs[existingIdx] = newBelief;
            } else {
                npc.beliefs.push(newBelief);
            }
        }

        // Fire-and-forget save
        this.npcRepository.saveState(npc).catch(err => console.error(err));
    }
}

module.exports = BeliefEngine;
