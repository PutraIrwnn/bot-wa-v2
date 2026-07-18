/**
 * IFactionRepository
 * Interface untuk persistensi Faction
 */
class IFactionRepository {
    /**
     * Memuat semua Faction dari storage
     * @param {Object} connection - (Opsional) Koneksi DB jika dalam Unit of Work
     * @returns {Promise<Object>} Map of Factions { id: FactionData }
     */
    async loadAll(connection = null) {
        throw new Error('Not implemented');
    }

    /**
     * Menyimpan state Faction ke storage
     * @param {Object} faction - Data faksi
     * @param {Object} connection - (Opsional) Koneksi DB jika dalam Unit of Work
     */
    async saveState(faction, connection = null) {
        throw new Error('Not implemented');
    }
}

module.exports = IFactionRepository;
