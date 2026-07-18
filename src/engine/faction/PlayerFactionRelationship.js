class PlayerFactionRelationship {
    /**
     * @param {string} playerId 
     * @param {string} factionId 
     * @param {Object} initialState 
     */
    constructor(playerId, factionId, initialState = {}) {
        this.playerId = playerId;
        this.factionId = factionId;
        
        this.trust = initialState.trust ?? 50;
        this.interactionCount = initialState.interactionCount || 0;
        
        // Immutable History Log
        // Format: { timestamp, day, event, delta, reason }
        this.history = initialState.historyLog || [];
    }

    /**
     * Update skor reputasi secara deterministik dari sebuah interaksi.
     * @param {string} eventName 
     * @param {number} deltaTrust 
     * @param {string} reason 
     * @param {number} currentDay 
     */
    applyInteraction(eventName, deltaTrust, reason, currentDay = 0) {
        this.trust = Math.max(0, Math.min(100, this.trust + deltaTrust));
        this.interactionCount++;

        this.history.push({
            timestamp: Date.now(),
            day: currentDay,
            event: eventName,
            delta: deltaTrust,
            reason: reason
        });
    }

    getTrust() {
        return this.trust;
    }

    getInteractionCount() {
        return this.interactionCount;
    }

    getHistory() {
        return [...this.history];
    }
}

module.exports = PlayerFactionRelationship;
