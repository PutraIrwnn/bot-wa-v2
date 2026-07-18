class Faction {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.goals = data.goals || '';
        this.policies = data.policies || '';
        this.sharedKnowledge = data.shared_knowledge || []; // Array of rumorId
    }

    addSharedKnowledge(rumorId) {
        if (!this.sharedKnowledge.includes(rumorId)) {
            this.sharedKnowledge.push(rumorId);
            return true;
        }
        return false;
    }
}

module.exports = Faction;
