class NarrationSanitizer {
    /**
     * Membersihkan teks keluaran AI
     * @param {string} text 
     * @returns {string}
     */
    sanitize(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let cleaned = text.trim();
        
        // Buang markdown berlebihan atau tag HTML liar (opsional)
        cleaned = cleaned.replace(/<[^>]*>?/gm, '');

        // Batasi panjang jika berhalusinasi kepanjangan
        if (cleaned.length > 500) {
            cleaned = cleaned.substring(0, 497) + '...';
        }

        return cleaned;
    }
}

module.exports = NarrationSanitizer;
