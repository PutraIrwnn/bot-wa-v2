class RelationshipEvaluator {
    static evaluate(relationship) {
        const labels = [];
        const dim = relationship.getDimensions();
        const history = relationship.getHistory();

        // Raw Evaluation (semua label yang mungkin berhak diberikan)
        if (dim.trust > 70 && dim.affinity > 50) labels.push('Trusted Ally');
        if (dim.trust > 70 && dim.affinity < -50) labels.push('Nemesis');
        if (dim.trust < -50 && dim.fear > 50) labels.push('Feared Enemy');
        if (dim.trust < -30 && dim.affinity < -30 && dim.fear <= 50) labels.push('Enemy');
        if (dim.respect > 80 && dim.fear < 20) labels.push('Mentor');
        
        if (dim.trust > 20) labels.push('Companion');
        if (dim.trust > 0 || dim.affinity > 0) labels.push('Acquaintance');
        if (dim.trust < 0 && dim.affinity < 0) labels.push('Rival');

        // History Evaluation
        if (history.some(h => h.event === 'life.saved')) labels.push('Life Saver');
        if (history.some(h => h.event === 'betrayal.detected')) labels.push('Betrayer');
        if (history.some(h => h.event === 'promise.broken')) labels.push('Oathbreaker');

        return [...new Set(labels)];
    }
}

class ConflictResolver {
    static resolve(labels) {
        let resolved = [...labels];
        
        // Tidak mungkin Nemesis dan Trusted Ally sekaligus
        if (resolved.includes('Nemesis') && resolved.includes('Trusted Ally')) {
            resolved = resolved.filter(l => l !== 'Trusted Ally');
        }

        // Tidak mungkin Feared Enemy dan Mentor (tergantung design, misal kita buang Mentor jika takut)
        if (resolved.includes('Feared Enemy') && resolved.includes('Mentor')) {
            resolved = resolved.filter(l => l !== 'Mentor');
        }

        return resolved;
    }
}

class PriorityResolver {
    static resolve(labels) {
        let resolved = [...labels];
        
        // Label Kuat vs Lemah
        const strongPositive = ['Trusted Ally', 'Life Saver'];
        const weakPositive = ['Companion', 'Acquaintance'];
        if (resolved.some(l => strongPositive.includes(l))) {
            resolved = resolved.filter(l => !weakPositive.includes(l));
        }

        const strongNegative = ['Nemesis', 'Feared Enemy', 'Enemy', 'Betrayer'];
        const weakNegative = ['Rival', 'Acquaintance'];
        if (resolved.some(l => strongNegative.includes(l))) {
            resolved = resolved.filter(l => !weakNegative.includes(l));
        }

        return resolved;
    }
}

class RelationshipClassifier {
    static classify(labels) {
        if (labels.length === 0) {
            return ['Stranger'];
        }
        return labels;
    }
}

class RelationshipPolicy {
    /**
     * Pipeline untuk mengevaluasi label sosial
     */
    static evaluateLabels(relationship) {
        let labels = RelationshipEvaluator.evaluate(relationship);
        labels = ConflictResolver.resolve(labels);
        labels = PriorityResolver.resolve(labels);
        labels = RelationshipClassifier.classify(labels);
        return labels;
    }
}

module.exports = RelationshipPolicy;
