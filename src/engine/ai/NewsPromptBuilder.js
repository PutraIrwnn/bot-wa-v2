class NewsPromptBuilder {
    /**
     * Membangun prompt untuk AI agar menuliskan berita dunia Aetheria.
     * @param {Object} edition - Objek NewsEdition dari NewsEngine
     * @returns {string} Prompt yang siap dikirim ke LLM
     */
    static build(edition) {
        if (!edition || !edition.rumors || edition.rumors.length === 0) {
            return "Tuliskan laporan singkat bahwa hari ini dunia Aetheria sangat damai dan tidak ada kejadian penting yang tercatat.";
        }

        const eventsText = edition.rumors.map((r, index) => {
            return `${index + 1}. ${r.rawText} (Kredibilitas: ${r.credibility}%)`;
        }).join('\n');

        return `Kamu adalah penulis "Aetheria Chronicle", koran harian terpercaya di dunia Aetheria.
Tugasmu adalah menulis edisi koran untuk Hari ke-${edition.day}.

Gunakan daftar kejadian mekanikal berikut sebagai bahan beritamu:
${eventsText}

Panduan Penulisan:
1. Tulis dengan gaya jurnalistik fantasi (seperti pengumuman Town Crier atau koran perkotaan).
2. Buat satu judul utama (Headline) yang menarik berdasarkan kejadian dengan kredibilitas tertinggi.
3. Rangkum kejadian lainnya sebagai berita singkat.
4. JANGAN pernah menyebutkan angka "Kredibilitas" secara langsung. Ubah menjadi nuansa kepastian (misal 90% = "Fakta yang tak terbantahkan", 30% = "Desas-desus liar").
5. Singkat, padat, dan dramatis. Jangan terlalu panjang (maksimal 3-4 paragraf pendek).`;
    }
}

module.exports = NewsPromptBuilder;
