/**
 * NarrationContext
 * DTO Resmi untuk menstandarkan aliran data antara ActionEngine dan NarrationProvider.
 * Beku. Tidak boleh diubah strukturnya tanpa keputusan arsitektural.
 */
class NarrationContext {
    /**
     * @param {Object} args
     * @param {string} args.intent - Aksi yang memicu narasi (misal: 'talk', 'help', 'world_event')
     * @param {Object} [args.player] - Data player yang berinteraksi (optional)
     * @param {Object} [args.npc] - Data NPC spesifik jika relevan (optional)
     * @param {Object} [args.world] - State dunia (musim, jam, cuaca) (optional)
     * @param {Array} [args.rumors] - Rumor aktif yang beredar di wilayah NPC (optional)
     */
    constructor({ intent, player = null, npc = null, world = null, rumors = [] }) {
        this.intent = intent;
        this.player = player;
        this.npc = npc;
        this.world = world;
        this.rumors = rumors;

        Object.freeze(this); // Mencegah mutasi data di lapisan Adapter
    }
}

module.exports = NarrationContext;
