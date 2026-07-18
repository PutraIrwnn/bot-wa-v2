const DomainEvents = require('../core/DomainEvents');
const FactionRelationship = require('./FactionRelationship');

class DiplomacyEngine {
    constructor(eventBus, factionRelRepo) {
        this.eventBus = eventBus;
        this.factionRelRepo = factionRelRepo;
        
        // Dictionary { "sourceId_targetId": FactionRelationship }
        this.relationships = {}; 

        this._registerListeners();
    }

    async init() {
        const relationsData = await this.factionRelRepo.loadAll();
        relationsData.forEach(data => {
            const key = this._getKey(data.sourceFactionId, data.targetFactionId);
            this.relationships[key] = new FactionRelationship(
                data.sourceFactionId, 
                data.targetFactionId, 
                data
            );
        });
    }

    _getKey(sourceId, targetId) {
        return `${sourceId}_${targetId}`;
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.WorldEventOccurred, this.handleWorldEvent.bind(this));
    }

    /**
     * @param {Object} payload - { type, factionA, factionB, reason }
     */
    async handleWorldEvent(payload) {
        const { type, factionA, factionB, reason } = payload;
        
        // Mapping tipe event dunia ke delta (Trust, Tension)
        let deltaTrust = 0;
        let deltaTension = 0;

        switch (type) {
            case 'RESOURCE_DISPUTE':
            case 'TERRITORY_DISPUTE':
                deltaTrust = -15;
                deltaTension = 20;
                break;
            case 'TRADE_AGREEMENT':
            case 'COMMON_ENEMY_SLAIN':
                deltaTrust = 20;
                deltaTension = -10;
                break;
            case 'BETRAYAL':
                deltaTrust = -40;
                deltaTension = 50;
                break;
            default:
                break;
        }

        if (deltaTrust !== 0 || deltaTension !== 0) {
            // Apply ke dua sisi karena kita mau memodelkan relasi dua arah secara terpisah
            await this._applyRelationshipChange(factionA, factionB, deltaTrust, deltaTension, reason);
            await this._applyRelationshipChange(factionB, factionA, deltaTrust, deltaTension, reason);
        }
    }

    async _applyRelationshipChange(sourceId, targetId, deltaTrust, deltaTension, reason) {
        const key = this._getKey(sourceId, targetId);
        
        if (!this.relationships[key]) {
            this.relationships[key] = new FactionRelationship(sourceId, targetId);
        }

        const rel = this.relationships[key];
        const result = rel.applyEvent(deltaTrust, deltaTension, reason);

        // Simpan state
        await this.factionRelRepo.saveState({
            sourceFactionId: rel.sourceFactionId,
            targetFactionId: rel.targetFactionId,
            trust: rel.trust,
            tension: rel.tension,
            status: rel.status,
            lastEvent: rel.lastEvent
        });

        // Trigger secondary domain event jika ada pergeseran status
        if (result.statusChanged) {
            const eventPayload = { sourceId, targetId, reason };
            if (result.newStatus === 'RIVAL') {
                this.eventBus.publish(DomainEvents.FactionRivalryFormed, eventPayload);
            } else if (result.newStatus === 'ALLY') {
                this.eventBus.publish(DomainEvents.FactionAllianceFormed, eventPayload);
            } else if (result.newStatus === 'NEUTRAL') {
                this.eventBus.publish(DomainEvents.FactionNeutralized, eventPayload);
            }
        }
    }
}

module.exports = DiplomacyEngine;
