/**
 * MarketRules
 * Mengevaluasi keramaian pasar berdasarkan evidence aggregation.
 */
class MarketRules {
    static get metadata() {
        return {
            id: 'rule_market_busy',
            priority: 'Medium',
            category: 'Economy',
            cooldown: 24, // Evaluasi maksimal 1 kali sehari
            evidenceThreshold: 30
        };
    }

    /**
     * @param {import('../StoryContext')} context 
     * @returns {Array<Object>} List of generated story events
     */
    static evaluate(context) {
        const events = [];
        const snapshot = context.currentSnapshot;
        
        if (!snapshot) return events;

        // Evidence Aggregation
        // Kita asumsikan Population Score berdasarkan jumlah NPC di pasar.
        const populationScore = snapshot.market_population * 10;
        
        // Noise Score bisa dipicu oleh rentetan event domain (misal npc bergerak ke pasar)
        const noiseScore = context.recentDomainEvents.filter(e => 
            e.type === 'npc.moved' && e.payload.location === 'pasar'
        ).length * 5;

        // Trading Score (misal ada transaksi) -> di masa depan

        const totalScore = populationScore + noiseScore;

        if (totalScore >= this.metadata.evidenceThreshold) {
            events.push({
                type: 'story.marketBusy',
                payload: {
                    score: totalScore,
                    description: 'Pasar terlihat sangat ramai dan bising.',
                    sourceRule: this.metadata.id
                }
            });
        }

        return events;
    }
}

module.exports = MarketRules;
