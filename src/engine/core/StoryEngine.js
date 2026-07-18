const DomainEvents = require('../core/DomainEvents');

class StoryEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;

        // Story Node Graph
        this.storyNodes = {
            'PROLOGUE_RINA_FORGETS': {
                id: 'PROLOGUE_RINA_FORGETS',
                status: 'locked', // locked, unlocked, completed
                condition: (fact) => fact.type === 'DAY_PASSED' && fact.dayCount >= 3,
                effects: () => {
                    console.log(`[StoryEngine] Story Unlocked: Prologue - Rina's Amnesia`);
                    this.eventBus.publish(DomainEvents.StoryNodeUnlocked, { nodeId: 'PROLOGUE_RINA_FORGETS' });
                }
            },
            'FOUND_RINA_CAT': {
                id: 'FOUND_RINA_CAT',
                status: 'locked',
                // Terbuka jika Prologue sudah completed, dan player explore ke gang sempit
                condition: (fact) => fact.type === 'PLAYER_ARRIVED' && fact.location === 'gang_sempit' && this.storyNodes['PROLOGUE_RINA_FORGETS'].status === 'completed',
                effects: () => {
                    console.log(`[StoryEngine] Story Unlocked: Found Rina's Cat`);
                }
            }
        };

        this.dayCount = 0;
        this._registerListeners();
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.DayPassed, () => {
            this.dayCount++;
            this.evaluateNodes({ type: 'DAY_PASSED', dayCount: this.dayCount });
        });
        
        this.eventBus.subscribe(DomainEvents.PlayerArrived, (fact) => {
            this.evaluateNodes({ type: 'PLAYER_ARRIVED', location: fact.location });
        });
    }

    evaluateNodes(fact) {
        for (const key in this.storyNodes) {
            const node = this.storyNodes[key];
            if (node.status === 'locked' && node.condition(fact)) {
                node.status = 'unlocked';
                node.effects();
            }
        }
    }
}

module.exports = StoryEngine;
