const DomainEvents = require('../core/DomainEvents');
const Relationship = require('./Relationship');
const RelationshipPolicy = require('./RelationshipPolicy');

const EvidenceStrength = require('./EvidenceStrength');

class RelationshipEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.relationships = {}; // Map of "sourceId_targetId" -> Relationship entity
        
        // Subscribe to fundamental domain events
        this.eventBus.subscribe(DomainEvents.LifeSaved, this.onLifeSaved.bind(this));
        this.eventBus.subscribe(DomainEvents.PromiseBroken, this.onPromiseBroken.bind(this));
        this.eventBus.subscribe(DomainEvents.BetrayalDetected, this.onBetrayalDetected.bind(this));
    }
    
    /**
     * Dapatkan entity Relationship (create jika belum ada)
     */
    getRelationship(sourceId, targetId) {
        const key = `${sourceId}_${targetId}`;
        if (!this.relationships[key]) {
            this.relationships[key] = new Relationship(sourceId, targetId);
        }
        return this.relationships[key];
    }

    /**
     * Mendapatkan label sosial (Derived State)
     */
    getRelationshipLabels(sourceId, targetId) {
        const rel = this.getRelationship(sourceId, targetId);
        return RelationshipPolicy.evaluateLabels(rel);
    }

    // --- Event Handlers ---

    async onLifeSaved(payload) {
        const { sourceId, targetId, reason, evidence } = payload;
        const rel = this.getRelationship(sourceId, targetId);
        const strength = (evidence instanceof EvidenceStrength) ? evidence : EvidenceStrength.FIRST_PERSON;
        const w = strength.weight();
        
        const delta = { trust: 50 * w, respect: 40 * w, affinity: 50 * w };
        rel.updateDimensions(delta);
        rel.appendHistory(DomainEvents.LifeSaved, delta, reason, strength);
    }

    async onPromiseBroken(payload) {
        const { sourceId, targetId, reason, evidence } = payload;
        const rel = this.getRelationship(sourceId, targetId);
        const strength = (evidence instanceof EvidenceStrength) ? evidence : EvidenceStrength.FIRST_PERSON;
        const w = strength.weight();
        
        const delta = { trust: -40 * w, respect: -30 * w, affinity: -20 * w };
        rel.updateDimensions(delta);
        rel.appendHistory(DomainEvents.PromiseBroken, delta, reason, strength);
    }
    
    async onBetrayalDetected(payload) {
        const { sourceId, targetId, reason, evidence } = payload;
        const rel = this.getRelationship(sourceId, targetId);
        const strength = (evidence instanceof EvidenceStrength) ? evidence : EvidenceStrength.FIRST_PERSON;
        const w = strength.weight();
        
        const delta = { trust: -80 * w, respect: -50 * w, affinity: -60 * w, fear: 20 * w };
        rel.updateDimensions(delta);
        rel.appendHistory(DomainEvents.BetrayalDetected, delta, reason, strength);
    }
}

module.exports = RelationshipEngine;
