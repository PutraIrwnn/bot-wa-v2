const DomainEvents = require('../core/DomainEvents');
const PlayerFactionRelationship = require('./PlayerFactionRelationship');

class FactionEngine {
    constructor(eventBus, factionRepo, playerFactionRelRepo) {
        this.eventBus = eventBus;
        this.factionRepo = factionRepo;
        this.playerFactionRelRepo = playerFactionRelRepo;
        
        this.factions = {};
        this.playerRelations = {}; // dictionary { "playerId_factionId": PlayerFactionRelationship }
        
        this._registerListeners();
    }

    async init() {
        this.factions = await this.factionRepo.loadAll();
        
        // Load relationships
        if (this.playerFactionRelRepo) {
            const rels = await this.playerFactionRelRepo.loadAll();
            rels.forEach(data => {
                const key = this._getRelKey(data.playerId, data.factionId);
                this.playerRelations[key] = new PlayerFactionRelationship(
                    data.playerId, 
                    data.factionId, 
                    data
                );
            });
        }
    }

    _getRelKey(playerId, factionId) {
        return `${playerId}_${factionId}`;
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.PlayerFactionInteraction, this.handlePlayerInteraction.bind(this));
    }

    async handlePlayerInteraction(payload) {
        // payload: { factionId, playerId, deltaTrust, reason, currentDay }
        const { factionId, playerId, deltaTrust, reason, currentDay } = payload;
        
        if (!this.playerFactionRelRepo) return; // guard if repo not injected (e.g. older tests)

        const faction = this.factions[factionId];
        if (faction) {
            const key = this._getRelKey(playerId, factionId);
            if (!this.playerRelations[key]) {
                this.playerRelations[key] = new PlayerFactionRelationship(playerId, factionId);
            }

            const rel = this.playerRelations[key];
            rel.applyInteraction('PLAYER_INTERACTION', deltaTrust, reason, currentDay);
            
            await this.playerFactionRelRepo.saveState(rel);
        }
    }
}

module.exports = FactionEngine;
