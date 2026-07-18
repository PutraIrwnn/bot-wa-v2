/**
 * IFactionRelationshipRepository
 * Interface untuk persistensi Faction Relationship (Diplomacy)
 */
class IFactionRelationshipRepository {
    /**
     * Memuat semua relasi antar faksi
     * @param {Object} connection - (Opsional)
     * @returns {Promise<Array>} Array of relationship objects
     */
    async loadAll(connection = null) {
        throw new Error('Not implemented');
    }

    /**
     * Menyimpan relasi antar faksi
     * @param {Object} relationship 
     * @param {Object} connection 
     */
    async saveState(relationship, connection = null) {
        throw new Error('Not implemented');
    }
}

module.exports = IFactionRelationshipRepository;
