const DomainEvents = require('../core/DomainEvents');

class NewsEngine {
    constructor(eventBus, rumorEngine) {
        this.eventBus = eventBus;
        this.rumorEngine = rumorEngine;
        this.latestEdition = null;
        
        this.eventBus.subscribe(DomainEvents.DayPassed, this.handleDayPassed.bind(this));
    }

    handleDayPassed(payload) {
        const day = payload.day;
        
        if (!this.rumorEngine) return;
        
        // Get all active rumors
        const activeRumors = Array.from(this.rumorEngine.globalRumors.values());
        
        // Sort by credibility descending, then heat descending
        activeRumors.sort((a, b) => {
            if (b.credibility !== a.credibility) {
                return b.credibility - a.credibility;
            }
            return b.heat - a.heat;
        });

        // Top 5 rumors for the news
        const topRumors = activeRumors.slice(0, 5).map(r => ({
            id: r.id,
            originEvent: r.originEvent,
            originLocation: r.originLocation,
            targetFactionId: r.targetFactionId,
            affinity: r.affinity,
            rawText: r.rawText,
            credibility: r.credibility
        }));

        this.latestEdition = {
            id: `edition_day_${day}`,
            day: day,
            rumors: topRumors,
            publishedAt: new Date().toISOString()
        };

        this.eventBus.publish(DomainEvents.NewsPublished, { editionId: this.latestEdition.id, day });
    }
}

module.exports = NewsEngine;
