/**
 * ILLMAdapter
 * Interface untuk abstrak LLM Adapter
 */
class ILLMAdapter {
    /**
     * Meminta narasi dari model LLM.
     * @param {string} systemInstruction - Aturan utama untuk AI (Persona, dll)
     * @param {string} userPrompt - Konteks dan perintah spesifik saat ini
     * @returns {Promise<string>} Teks respons murni
     */
    async generateNarration(systemInstruction, userPrompt) {
        throw new Error('generateNarration() must be implemented');
    }
}

module.exports = ILLMAdapter;
