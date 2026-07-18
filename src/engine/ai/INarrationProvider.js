/**
 * INarrationProvider
 * Antarmuka abstrak agar ActionEngine tidak tahu apakah narasi dibentuk oleh LLM, Template, atau Manusia.
 */
class INarrationProvider {
    /**
     * @param {Object} context - NarrationContext (npc, player, world, dsb)
     * @param {string} intent - Apa yang terjadi (misal: "talk", "help", "attack")
     * @returns {Promise<string>}
     */
    async provideNarration(context, intent) {
        throw new Error('provideNarration() must be implemented');
    }
}

module.exports = INarrationProvider;
