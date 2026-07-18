class InMemorySnapshotRepository {
    constructor() {
        this.currentSnapshot = null;
        this.history = [];
    }

    async upsertCurrentSnapshot(snapshot) {
        this.currentSnapshot = snapshot;
    }

    async insertHistoricalSnapshot(snapshot) {
        this.history.push(snapshot);
    }
}

module.exports = InMemorySnapshotRepository;
