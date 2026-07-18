/**
 * NPCBelief
 * Representasi kognitif NPC: Apakah dia memercayai suatu rumor.
 */
class NPCBelief {
    /**
     * @param {Object} args
     * @param {string} args.rumorId - ID rumor
     * @param {number} args.beliefScore - Seberapa percaya (0-100)
     * @param {string} args.certainty - Tingkat keyakinan: 'LOW', 'MEDIUM', 'HIGH'
     * @param {string} args.reason - Alasan percaya/tidak percaya (e.g. 'Highly trusts source Rina')
     * @param {number} args.lastEvaluated - Tick/Hari kapan belief ini terakhir di-evaluasi
     */
    constructor({ rumorId, beliefScore, certainty, reason, lastEvaluated }) {
        this.rumorId = rumorId;
        this.beliefScore = beliefScore || 0;
        this.certainty = certainty || 'LOW';
        this.reason = reason || '';
        this.lastEvaluated = lastEvaluated || 0;
    }
}

module.exports = NPCBelief;
