const ILLMAdapter = require('./ILLMAdapter');
const { GoogleGenAI } = require('@google/genai');

class GeminiAdapter extends ILLMAdapter {
    constructor(apiKey) {
        super();
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }

    async generateNarration(systemInstruction, userPrompt) {
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.7,
                }
            });
            return response.text;
        } catch (error) {
            // Kita log error secara internal (bisa ke file log), 
            // tapi kita lemparkan ke PromptEngine agar dia fallback
            throw new Error(`GeminiAPI Error: ${error.message}`);
        }
    }
}

module.exports = GeminiAdapter;
