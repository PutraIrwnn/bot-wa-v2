class FactionRelationship {
    /**
     * @param {string} sourceFactionId 
     * @param {string} targetFactionId 
     * @param {Object} initialState - (Opsional) data awal trust, tension, status
     */
    constructor(sourceFactionId, targetFactionId, initialState = {}) {
        // Karena relasi faksi itu bidirectional tapi kita simpan as a directed graph untuk fleksibilitas 
        // (contoh Faksi A percaya Faksi B, tapi B tidak), kita butuh source dan target.
        // Di sistem ini kita asumsikan simetris untuk mempermudah, 
        // tapi secara model tetap dipisah untuk mengakomodir asimetri ke depannya.
        this.sourceFactionId = sourceFactionId;
        this.targetFactionId = targetFactionId;
        
        this.trust = initialState.trust ?? 50;
        this.tension = initialState.tension ?? 0;
        this.status = initialState.status || 'NEUTRAL'; // ALLY, NEUTRAL, RIVAL
        this.lastEvent = initialState.lastEvent || null;
    }

    /**
     * Memperbarui trust dan tension lalu mengevaluasi status baru
     * @param {number} deltaTrust 
     * @param {number} deltaTension 
     * @param {string} reason 
     * @returns {Object} { statusChanged: boolean, previousStatus: string, newStatus: string }
     */
    applyEvent(deltaTrust, deltaTension, reason) {
        this.trust = Math.max(0, Math.min(100, this.trust + deltaTrust));
        this.tension = Math.max(0, Math.min(100, this.tension + deltaTension));
        this.lastEvent = reason;

        const previousStatus = this.status;

        // Evaluasi Deterministik
        if (this.tension > 75 && this.trust < 30) {
            this.status = 'RIVAL';
        } else if (this.trust > 80 && this.tension < 20) {
            this.status = 'ALLY';
        } else if ((this.status === 'RIVAL' && this.tension < 50 && this.trust > 40) ||
                   (this.status === 'ALLY' && this.trust < 60 && this.tension > 40)) {
            // Revert ke Neutral jika syarat khusus Rival/Ally tak lagi terpenuhi secara moderat
            this.status = 'NEUTRAL';
        }

        return {
            statusChanged: previousStatus !== this.status,
            previousStatus,
            newStatus: this.status
        };
    }
}

module.exports = FactionRelationship;
