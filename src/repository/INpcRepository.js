/**
 * INpcRepository
 * Abstraksi untuk mekanisme penyimpanan NPC.
 */
class INpcRepository {
    async findById(npcId) {
        throw new Error("Method not implemented.");
    }
    
    async loadAll() {
        throw new Error("Method not implemented.");
    }

    async saveState(npc) {
        throw new Error("Method not implemented.");
    }
}

module.exports = INpcRepository;
