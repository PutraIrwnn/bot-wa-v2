/**
 * StoryContext
 * Kontrak resmi untuk mengevaluasi rule di dalam StoryEngine.
 * Memuat Snapshot terkini dan History Domain Events jika diperlukan.
 */
class StoryContext {
    /**
     * @param {Object} args
     * @param {Object} args.currentSnapshot - Instance dari WorldSnapshotDTO
     * @param {Array<Object>} args.recentDomainEvents - Array kejadian terbaru (misal: npc.moved)
     */
    constructor({ currentSnapshot, recentDomainEvents }) {
        this.currentSnapshot = currentSnapshot;
        this.recentDomainEvents = recentDomainEvents || [];
        
        Object.freeze(this);
    }
}

module.exports = StoryContext;
