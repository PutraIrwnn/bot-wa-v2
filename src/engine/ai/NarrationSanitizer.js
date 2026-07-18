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
        
        // 1. Buang AI-isms (basa basi bot)
        // Match things like "Tentu, ini narasinya:" atau "Berikut adalah responsnya:"
        cleaned = cleaned.replace(/^(tentu|baik|berikut|ini|silakan|silahkan)[^:\n]*:/i, '').trim();

        // 2. Buang markdown berlebihan atau tag HTML liar (opsional)
        cleaned = cleaned.replace(/<[^>]*>?/gm, '');

        // 3. Buang statistik mekanikal jika bocor (misal: [Trust: 80], (Mood: Marah), Trust=90)
        // Regex menangkap kurung siku, kurung biasa, atau kata yang diikuti titik dua/sama dengan dan angka
        cleaned = cleaned.replace(/[\[\(]?(trust|memory|mood|activity|health)\s*[:=]\s*\w+[\]\)]?/gi, '');
        
        // Membersihkan spasi ganda akibat regex
        cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

        // Batasi panjang jika berhalusinasi kepanjangan
        if (cleaned.length > 500) {
            cleaned = cleaned.substring(0, 497) + '...';
        }

        return cleaned;
    }
}

module.exports = NarrationSanitizer;
