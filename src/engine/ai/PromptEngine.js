const INarrationProvider = require('./INarrationProvider');
const NarrationSanitizer = require('./NarrationSanitizer');
const NPCPromptBuilder = require('./NPCPromptBuilder');

class PromptEngine extends INarrationProvider {
    /**
     * @param {ILLMAdapter} llmAdapter 
     */
    constructor(llmAdapter) {
        super();
        this.llmAdapter = llmAdapter;
        this.sanitizer = new NarrationSanitizer();
        this.npcPromptBuilder = new NPCPromptBuilder();
    }

    /**
     * Membuat System Prompt dasar (Konstitusi AI)
     */
    _buildSystemInstruction() {
        return `Kamu adalah narator dunia Aetheria. 
Aturan mutlak: 
1. Kamu hanya boleh mendeskripsikan adegan, aksi, dan ucapan NPC.
2. Jangan pernah menyebut statistik (seperti Trust: 80, Memory: 20) di dalam narasimu. Ubah menjadi ekspresi natural (Trust tinggi = ramah, Memory rendah = linglung).
3. Jangan menghasilkan keputusan mekanikal atau mengubah state.
4. Tulis narasi singkat (1-3 kalimat).
5. Gunakan bahasa Indonesia.`;
    }

    /**
     * Membangun prompt dari konteks dengan mendelegasikan ke Builder spesifik
     */
    _buildUserPrompt(context) {
        // Saat ini baru ada NPC context. Nanti bisa cek context.type atau ada indikator lain
        if (context.npc) {
            return this.npcPromptBuilder.build(context);
        }
        
        return `Pemain (${context.player || 'Seseorang'}) melakukan aksi: ${context.intent}. Buat narasi.`;
    }

    /**
     * Memanggil LLM Adapter dengan batas waktu 6 detik
     */
    async _callLLMWithTimeout(systemInstruction, userPrompt) {
        // Timeout 6 detik
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('AI Request Timeout')), 6000)
        );

        const llmPromise = this.llmAdapter.generateNarration(systemInstruction, userPrompt);
        
        return Promise.race([llmPromise, timeoutPromise]);
    }

    /**
     * Implementasi INarrationProvider
     * @param {NarrationContext} context
     */
    async provideNarration(context) {
        const systemInstruction = this._buildSystemInstruction();
        const userPrompt = this._buildUserPrompt(context);

        try {
            const rawResponse = await this._callLLMWithTimeout(systemInstruction, userPrompt);
            const cleanResponse = this.sanitizer.sanitize(rawResponse);
            
            if (!cleanResponse) throw new Error("Empty AI Response");
            
            return cleanResponse;
        } catch (error) {
            // Graceful Fallback dari Rule Engine
            const npcName = context.npc?.name || "Seseorang";
            if (context.intent === 'talk') {
                return `*${npcName} menyapamu.* "Halo..." (Sistem AI sedang offline)`;
            } else if (context.intent === 'help') {
                return `*${npcName} menerima bantuanmu.* (Sistem AI sedang offline)`;
            }
            return `*${npcName} terdiam.* (Sistem AI sedang offline)`;
        }
    }
}

module.exports = PromptEngine;
