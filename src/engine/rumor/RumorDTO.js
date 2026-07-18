/**
 * RumorDTO
 * Representasi sosial (Gosip) dari sebuah fakta atau kejadian.
 */
class RumorDTO {
    /**
     * @param {Object} args
     * @param {string} args.id - Unique ID (e.g. 'rumor_harvest_1')
     * @param {string} args.originEvent - Tipe event asal (e.g. 'story.harvestFailed')
     * @param {string} args.originLocation - Lokasi kemunculan awal rumor
     * @param {number} args.createdDay - Hari pembuatan rumor
     * @param {number} args.heat - Seberapa viral rumor ini (0-100)
     * @param {number} args.credibility - Seberapa valid rumor ini (0-100)
     * @param {string} [args.targetFactionId] - ID Faksi jika rumor terkait faksi
     * @param {string} [args.affinity] - 'positive' atau 'negative' jika terkait faksi
     * @param {string} [args.rawText] - Teks rumor
     */
    constructor({ id, originEvent, originLocation, createdDay, heat, credibility, targetFactionId, affinity, rawText }) {
        this.id = id;
        this.originEvent = originEvent;
        this.originLocation = originLocation || 'unknown';
        this.createdDay = createdDay;
        this.heat = heat || 100;
        this.credibility = credibility || 50;
        this.targetFactionId = targetFactionId;
        this.affinity = affinity;
        this.rawText = rawText || '';
        
        // Status siklus hidup: 'Active', 'Decaying', 'Forgotten'
        this.lifecycleState = 'Active';
    }
}

module.exports = RumorDTO;
