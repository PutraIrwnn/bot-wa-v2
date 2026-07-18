/**
 * HarvestRules
 * Mengevaluasi kegagalan panen berdasarkan kondisi ekologi.
 */
class HarvestRules {
    static get metadata() {
        return {
            id: 'rule_harvest_failed',
            priority: 'High',
            category: 'Agriculture',
            cooldown: 720 // Maksimal 1 kali sebulan (30 hari * 24 tick)
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

        // Misal: Jika badai berkepanjangan pada Musim Panas atau saat hari-hari tertentu
        // Untuk Sprint 8, kita trigger jika Weather = Storm
        if (snapshot.weather === 'Storm') {
            events.push({
                type: 'story.harvestFailed',
                payload: {
                    reason: 'Badai hebat menerjang lahan pertanian.',
                    sourceRule: this.metadata.id
                }
            });
        }

        return events;
    }
}

module.exports = HarvestRules;
