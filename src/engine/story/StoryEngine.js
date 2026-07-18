const DomainEvents = require('../core/DomainEvents');
const StoryContext = require('./StoryContext');
const MarketRules = require('./StoryRules/MarketRules');
const HarvestRules = require('./StoryRules/HarvestRules');

/**
 * StoryEngine (Causality Engine)
 * Pengamat pasif yang mengevaluasi hukum sebab-akibat (rules) lalu 
 * mempublikasikan "Story Event". Ia tidak mengubah World State secara langsung.
 */
class StoryEngine {
    constructor(eventBus, snapshotRepository) {
        this.eventBus = eventBus;
        this.snapshotRepository = snapshotRepository;
        this.recentEventsQueue = [];

        // Dengarkan denyut perubahan alam dan aktivitas NPC
        this.eventBus.subscribe('world.stateEvolution', this.onStateEvolution.bind(this));
        this.eventBus.subscribe(DomainEvents.NpcMoved, this.onNpcMoved.bind(this));
    }

    onNpcMoved(payload) {
        // Kumpulkan bukti (evidence)
        this.recentEventsQueue.push({ type: 'npc.moved', payload });
        
        // Jaga memori queue agar tidak meledak (opsional)
        if (this.recentEventsQueue.length > 50) {
            this.recentEventsQueue.shift();
        }
    }

    async onStateEvolution(payload) {
        // Setiap tick evaluasi cerita dari Current Snapshot
        const currentSnapshot = this.snapshotRepository.currentSnapshot;
        if (!currentSnapshot) return;

        const context = new StoryContext({
            currentSnapshot: currentSnapshot,
            recentDomainEvents: [...this.recentEventsQueue]
        });

        // Kosongkan antrean event pasca-evaluasi agar tidak tersangkut ganda
        this.recentEventsQueue = [];

        // Evaluasi semua rules
        const derivedEvents = [
            ...MarketRules.evaluate(context),
            ...HarvestRules.evaluate(context)
        ];

        // Publish penemuan cerita
        for (const event of derivedEvents) {
            this.eventBus.publish(event.type, event.payload);
        }
    }
}

module.exports = StoryEngine;
