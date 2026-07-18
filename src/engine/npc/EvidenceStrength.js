class EvidenceStrength {
    constructor(level) {
        this.level = level; // RUMOR, WITNESS, VERIFIED, FIRST_PERSON
        Object.freeze(this); // Value Object must be immutable
    }

    weight() {
        switch (this.level) {
            case 'FIRST_PERSON': return 1.0;
            case 'VERIFIED': return 0.8;
            case 'WITNESS': return 0.5;
            case 'RUMOR': return 0.2;
            default: return 0.1;
        }
    }

    decayRate() {
        switch (this.level) {
            case 'FIRST_PERSON': return 0.01; // Sangat sulit dilupakan
            case 'VERIFIED': return 0.05;
            case 'WITNESS': return 0.1;
            case 'RUMOR': return 0.3; // Mudah dilupakan/decay
            default: return 1.0;
        }
    }

    shareProbability() {
        switch (this.level) {
            case 'FIRST_PERSON': return 0.9; // Menyebarkan pengalaman sendiri
            case 'VERIFIED': return 0.7;
            case 'WITNESS': return 0.6;
            case 'RUMOR': return 0.95; // Rumor sangat mudah tersebar
            default: return 0;
        }
    }
}

// Pre-defined instances (Flyweight pattern)
EvidenceStrength.RUMOR = new EvidenceStrength('RUMOR');
EvidenceStrength.WITNESS = new EvidenceStrength('WITNESS');
EvidenceStrength.VERIFIED = new EvidenceStrength('VERIFIED');
EvidenceStrength.FIRST_PERSON = new EvidenceStrength('FIRST_PERSON');

module.exports = EvidenceStrength;
