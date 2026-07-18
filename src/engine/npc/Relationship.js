class Relationship {
    /**
     * @param {string} sourceId - ID Entitas yang memiliki relasi (misal: NPC-01)
     * @param {string} targetId - ID Entitas yang menjadi target relasi (misal: Player-01)
     */
    constructor(sourceId, targetId) {
        this.sourceId = sourceId;
        this.targetId = targetId;

        // Dimensions (Input for evaluation)
        this.dimensions = {
            trust: 0,
            respect: 0,
            fear: 0,
            affinity: 0
        };

        // Immutable History Log
        // Format: { timestamp, event, delta, reason, evidence }
        this.history = [];
        // Lifecycle State
        this.status = 'ACTIVE'; // ACTIVE, DORMANT, ARCHIVED
        this.lastInteractionDay = 0; 
    }

    /**
     * Update dimensi secara parsial
     * @param {Object} delta - Kumpulan perubahan dimensi, misal { trust: 10, fear: -5 }
     */
    updateDimensions(delta) {
        for (const [key, value] of Object.entries(delta)) {
            if (this.dimensions[key] !== undefined) {
                this.dimensions[key] += value;
                // Pastikan nilai berada dalam range wajar (misal -100 s/d 100)
                this.dimensions[key] = Math.max(-100, Math.min(100, this.dimensions[key]));
            }
        }
    }

    /**
     * Menambahkan histori kejadian relasi secara append-only.
     * Tidak ada metode untuk menghapus/edit histori (Immutable History).
     */
    appendHistory(event, delta, reason, evidence, currentDay = 0) {
        this.history.push({
            timestamp: Date.now(),
            day: currentDay,
            event,
            delta,
            reason,
            evidence
        });
        
        this.lastInteractionDay = currentDay;
        this.status = 'ACTIVE';
    }

    getHistory() {
        return [...this.history]; // Return copy to prevent mutation
    }

    getDimensions() {
        return { ...this.dimensions };
    }
}

module.exports = Relationship;
