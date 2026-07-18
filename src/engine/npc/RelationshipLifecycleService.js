const DomainEvents = require('../core/DomainEvents');

class RelationshipLifecycleService {
    constructor(eventBus, relationshipEngine) {
        this.eventBus = eventBus;
        this.relationshipEngine = relationshipEngine;

        this.eventBus.subscribe(DomainEvents.DayPassed, this.onDayPassed.bind(this));
    }

    async onDayPassed(payload) {
        const currentDay = payload.day || 0;
        const relationships = Object.values(this.relationshipEngine.relationships);

        for (const rel of relationships) {
            const daysSinceInteraction = currentDay - rel.lastInteractionDay;

            if (rel.status === 'ACTIVE' && daysSinceInteraction >= 30) {
                rel.status = 'DORMANT';
                this.decayDimensions(rel);
                this.eventBus.publish('relationship.decayed', {
                    sourceId: rel.sourceId,
                    targetId: rel.targetId,
                    newStatus: 'DORMANT'
                });
            } else if (rel.status === 'DORMANT' && daysSinceInteraction >= 100) {
                rel.status = 'ARCHIVED';
                this.decayDimensions(rel);
                this.eventBus.publish('relationship.decayed', {
                    sourceId: rel.sourceId,
                    targetId: rel.targetId,
                    newStatus: 'ARCHIVED'
                });
            }
        }
    }

    decayDimensions(rel) {
        // Decay murni: mendekati 0 sebesar 50%
        const current = rel.getDimensions();
        const delta = {
            trust: -Math.round(current.trust / 2),
            respect: -Math.round(current.respect / 2),
            fear: -Math.round(current.fear / 2),
            affinity: -Math.round(current.affinity / 2)
        };
        rel.updateDimensions(delta);
    }
}

module.exports = RelationshipLifecycleService;
