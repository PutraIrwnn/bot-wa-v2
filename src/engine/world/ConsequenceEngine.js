const DomainEvents = require('../core/DomainEvents');

/**
 * ConsequenceEngine (WorldEngine Subsystem)
 * Mengawasi Story Events dan memutuskan apakah mereka cukup valid
 * untuk mengubah World State secara permanen.
 */
class ConsequenceEngine {
    constructor(eventBus, worldRepository) {
        this.eventBus = eventBus;
        this.worldRepository = worldRepository;
        
        // Listen to derived stories
        this.eventBus.subscribe('story.harvestFailed', this.onHarvestFailed.bind(this));
        // Event-driven prediction evaluation
        this.eventBus.subscribe('story.resolved', this.onStoryResolved.bind(this));
    }

    async onStoryResolved(payload) {
        // Evaluasi prediksi secara event-driven
        if (payload.isPredictionCorrect) {
            this.eventBus.publish('world.predictionCorrect', { storyId: payload.storyId, actors: payload.actors });
        } else {
            this.eventBus.publish('world.predictionWrong', { storyId: payload.storyId, actors: payload.actors });
        }
    }

    async onHarvestFailed(payload) {
        // Consequence Layer menentukan bahwa Panen Gagal menyebabkan suplai makanan merosot
        console.log('[ConsequenceEngine] Menurunkan World Food Supply karena Panen Gagal!');
        
        // Asumsi repository punya method khusus atau key khusus
        const state = await this.worldRepository.loadState();
        state['food_supply'] = 'LOW';
        
        await this.worldRepository.saveState('food_supply', 'LOW');
        
        // Event konfirmasi State Update permanen
        this.eventBus.publish('world.consequenceApplied', { key: 'food_supply', value: 'LOW' });
    }
}

module.exports = ConsequenceEngine;
