const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Pastikan API_KEY dipanggil benar dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Daftar model fallback (urut dari quota terbanyak → terkecil)
const MODELS = [
    'gemini-3.1-flash-lite',   // 15 RPM — paling banyak
    'gemini-2.5-flash-lite',   // 10 RPM
    'gemini-3-flash',          // 5 RPM
    'gemini-2.5-flash',        // 5 RPM
    'gemini-3.5-flash',        // 5 RPM (sering penuh, taruh terakhir)
];

// Helper: delay untuk retry
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: coba generate content dengan retry
async function tryGenerate(modelName, prompt, historyContext = [], maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction: 'Kamu adalah teman ngobrol virtual cowok dari dunia AU (Alternate Universe). Kepribadianmu humble, soft-spoken, dan kamu adalah pendengar yang sangat baik. Gaya mengetikmu adalah "typing ganteng" (rapi, santai, tidak kaku, berikan kesan hangat dan empatik). Jika user sedang bercerita atau curhat, berikan respons yang menenangkan dan validasi perasaan mereka. Jangan pernah terdengar seperti AI atau robot kaku. Gunakan bahasa Indonesia santai yang sopan (aku-kamu).'
            });
            
            const formattedHistory = historyContext.map(row => {
                let textContent = row.message;
                
                if (row.role === 'system') {
                    textContent = `[NOTIFIKASI SISTEM UNTUKMU: ${row.message}]`;
                    return { role: 'user', parts: [{ text: textContent }] };
                }
                
                if (row.role === 'user' && row.sender_jid) {
                    const senderNumber = row.sender_jid.split('@')[0];
                    textContent = `[Pengirim: ${senderNumber}]\n${row.message}`;
                }
                
                return {
                    role: row.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: textContent }]
                };
            });

            const chat = model.startChat({ history: formattedHistory });
            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            const isRetryable = error.status === 503 || error.status === 500;
            
            if (isRetryable && attempt < maxRetries) {
                const waitTime = attempt * 3000; // 3s, 6s, 9s (exponential-ish backoff)
                console.log(`⏳ Model ${modelName} error ${error.status}, retry ${attempt}/${maxRetries} dalam ${waitTime/1000}s...`);
                await delay(waitTime);
                continue;
            }
            
            throw error; // non-retryable atau sudah max retry
        }
    }
}

async function askGemini(prompt, historyContext = []) {
    let lastError = null;

    for (const modelName of MODELS) {
        try {
            console.log(`🤖 Mencoba model: ${modelName}`);
            const text = await tryGenerate(modelName, prompt, historyContext, 3);
            console.log(`✅ Berhasil dengan model: ${modelName}`);
            return text;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Model ${modelName} gagal (${error.status || 'unknown'}): ${error.message?.slice(0, 80)}`);

            // Jika 429 (quota habis) atau 404 (model unavailable), langsung coba model berikutnya
            if (error.status === 429 || error.status === 404) {
                continue;
            }
        }
    }

    // Semua model gagal
    console.error("❌ Semua model Gemini gagal.");
    throw lastError;
}

module.exports = { askGemini };
