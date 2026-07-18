/**
 * IWorldRepository
 * Abstraksi untuk mekanisme penyimpanan World State (Cuaca, Node Cerita, dsb).
 */
class IWorldRepository {
    async loadState() {
        throw new Error("Method not implemented.");
    }

    async saveState(key, value) {
        throw new Error("Method not implemented.");
    }
}

module.exports = IWorldRepository;
