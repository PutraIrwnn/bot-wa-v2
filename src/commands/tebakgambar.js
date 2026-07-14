const sessionManager = require('../engine/sessionManager');
const { generateImage } = require('../plugins/imageGenerator');
const { saveSystemLog } = require('../utils/logger');
const { askGemini } = require('../plugins/ai');
const fallbackQuestions = require('../data/tebakgambar_questions');

// ═══════════════════════════════════════════════════════════
//  🧠 AI Question Cache — Batch Generation System
//  1 API call = 5 soal → hemat 5x quota Gemini
// ═══════════════════════════════════════════════════════════

const questionCache = [];           // In-memory cache of pre-generated questions
const recentAnswers = [];           // Track recent answers to avoid repeats
const MAX_RECENT_ANSWERS = 30;
const BATCH_SIZE = 5;               // Generate 5 questions per API call
let isGenerating = false;           // Prevent concurrent batch generation

/**
 * Generate a BATCH of questions using 1 Gemini API call.
 * Returns array of question objects, or empty array on failure.
 */
async function generateBatchQuestions() {
    if (isGenerating) return []; // Prevent double-calls
    isGenerating = true;

    const avoidList = recentAnswers.length > 0 
        ? `\nJANGAN gunakan jawaban berikut (sudah pernah keluar): ${recentAnswers.join(', ')}` 
        : '';

    const categories = [
        'hewan unik atau langka', 'landmark terkenal dunia', 'makanan khas dari berbagai negara',
        'alat musik tradisional', 'kendaraan atau transportasi', 'buah-buahan tropis',
        'olahraga atau atlet', 'planet atau luar angkasa', 'bunga atau tanaman',
        'pakaian tradisional dunia', 'tokoh kartun terkenal', 'bangunan bersejarah',
        'profesi atau pekerjaan unik', 'peralatan dapur', 'fenomena alam'
    ];

    // Pick 5 random different categories for variety
    const shuffled = categories.sort(() => Math.random() - 0.5);
    const selectedCategories = shuffled.slice(0, BATCH_SIZE);

    const prompt = `Kamu adalah pembuat soal untuk game "Tebak Gambar" di WhatsApp.
Buatkan ${BATCH_SIZE} soal SEKALIGUS, masing-masing dari kategori berbeda:
${selectedCategories.map((c, i) => `${i + 1}. ${c}`).join('\n')}
${avoidList}

Jawab HANYA dalam format JSON Array (tanpa markdown, tanpa backtick, tanpa penjelasan):
[
  {
    "question": "🖼️ [pertanyaan singkat]",
    "answer": ["jawaban_utama", "sinonim1", "sinonim2"],
    "imagePrompt": "[LIHAT ATURAN imagePrompt DI BAWAH]",
    "hint": "[petunjuk singkat bahasa Indonesia dengan 1 emoji]",
    "points": 10
  }
]

Aturan PENTING:
- Jawaban harus 1-2 kata saja (mudah diketik user)
- Sertakan minimal 2 sinonim/variasi ejaan per soal
- hint dalam bahasa Indonesia, singkat
- Pilih subjek SPESIFIK (bukan "burung" tapi "merak")
- Semua ${BATCH_SIZE} soal HARUS berbeda topik

Aturan KRITIS untuk imagePrompt (WAJIB DIIKUTI):
- HARUS dalam bahasa Inggris
- HARUS menyebutkan nama ENGLISH/SCIENTIFIC dari subjek (contoh: "proboscis monkey" bukan "rare monkey", "angklung bamboo musical instrument" bukan "traditional instrument")
- HARUS mendeskripsikan CIRI FISIK UNIK yang membedakan subjek dari benda serupa. Contoh:
  * Bekantan → "a proboscis monkey (Nasalis larvatus) with its distinctive very long, large, bulbous drooping nose, reddish-brown fur, sitting on a mangrove branch in Borneo rainforest"
  * Angklung → "an angklung, a traditional Sundanese bamboo musical instrument made of bamboo tubes attached to a bamboo frame, tubes are carved to have a resonant pitch when shaken"
  * Komodo → "a Komodo dragon (Varanus komodoensis), the world's largest lizard, with rough scaly grey skin, forked yellow tongue sticking out, muscular body"
- JANGAN menulis deskripsi generik seperti "a rare animal" atau "a traditional instrument"
- Tambahkan gaya fotografi: "realistic photograph, 4k, detailed, studio lighting" atau "wildlife photography, National Geographic style"
- JANGAN ada teks/tulisan di gambar`;

    try {
        console.log(`🧠 Generating batch of ${BATCH_SIZE} questions...`);
        const response = await askGemini(prompt, []);
        
        // Parse JSON (handle markdown wrapping)
        let jsonStr = response.trim();
        jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        
        const parsed = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) {
            console.error('❌ AI response is not an array');
            isGenerating = false;
            return [];
        }

        // Validate and filter each question
        const validQuestions = parsed.filter(q => {
            if (!q.question || !q.answer || !q.imagePrompt || !q.hint) return false;
            if (!Array.isArray(q.answer)) q.answer = [String(q.answer)];
            q.points = q.points || 10;
            return true;
        });

        // Track answers to avoid future repeats
        for (const q of validQuestions) {
            recentAnswers.push(q.answer[0]);
            if (recentAnswers.length > MAX_RECENT_ANSWERS) recentAnswers.shift();
        }

        console.log(`✅ Batch generated: ${validQuestions.length}/${BATCH_SIZE} valid questions cached`);
        isGenerating = false;
        return validQuestions;

    } catch (error) {
        console.error('❌ Batch Generation Failed:', error.message);
        isGenerating = false;
        return [];
    }
}

/**
 * Get a question — from cache first, then generate batch, then fallback.
 * @returns {{ question: object, source: string }}
 */
async function getQuestion() {
    // 1. Try cache first (FREE — no API call!)
    if (questionCache.length > 0) {
        const q = questionCache.shift();
        console.log(`📦 Serving from cache (${questionCache.length} remaining): "${q.answer[0]}"`);
        
        // Pre-fill cache in background if running low (don't await)
        if (questionCache.length <= 1) {
            generateBatchQuestions().then(batch => {
                questionCache.push(...batch);
                if (batch.length > 0) console.log(`🔄 Cache refilled: ${questionCache.length} questions ready`);
            }).catch(() => {});
        }
        
        return { question: q, source: '🧠 AI' };
    }

    // 2. Cache empty — generate new batch
    const batch = await generateBatchQuestions();
    if (batch.length > 0) {
        const q = batch.shift();             // Take first for current game
        questionCache.push(...batch);        // Cache the rest
        console.log(`🧠 Fresh batch! Serving: "${q.answer[0]}" (${questionCache.length} cached)`);
        return { question: q, source: '🧠 AI' };
    }

    // 3. AI completely failed — use hardcoded fallback
    const q = pickFallbackQuestion();
    console.log(`⚠️ AI unavailable, fallback: "${q.answer[0]}"`);
    return { question: q, source: '📦 Pool' };
}

/**
 * Fallback: Pick a random question from the hardcoded pool.
 */
const recentFallbackIdx = [];
function pickFallbackQuestion() {
    let available = fallbackQuestions
        .map((_, i) => i)
        .filter(i => !recentFallbackIdx.includes(i));

    if (available.length === 0) {
        recentFallbackIdx.length = 0;
        available = fallbackQuestions.map((_, i) => i);
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    recentFallbackIdx.push(idx);
    if (recentFallbackIdx.length > 10) recentFallbackIdx.shift();

    return fallbackQuestions[idx];
}

module.exports = {
    name: 'tebakgambar',
    aliases: ['!tebakgambar', '!tg'],
    rateLimit: { maxRequests: 3, windowMs: 120_000 }, // Max 3x per 2 menit

    async execute(sock, msg, chatJid, messageText, senderJid) {
        // 1. Check if a game is already running in this chat
        if (sessionManager.has(chatJid)) {
            return await sock.sendMessage(chatJid, { 
                text: '⚠️ Masih ada game yang berjalan di sini! Jawab dulu atau tunggu waktu habis.' 
            }, { quoted: msg });
        }

        try {
            // 2. Send "loading" indicator
            await sock.sendPresenceUpdate('composing', chatJid);
            await sock.sendMessage(chatJid, { 
                text: '🎮 *TEBAK GAMBAR!*\n\n🧠 AI sedang menyiapkan soal unik untukmu...' 
            }, { quoted: msg });

            // 3. Get question (from cache → batch generate → fallback)
            const { question, source } = await getQuestion();

            // 4. Generate the image via Pollinations AI
            const imageBuffer = await generateImage(question.imagePrompt);

            // 5. Create game session BEFORE sending image (TTL: 35 seconds)
            const session = sessionManager.create(chatJid, 'tebakgambar', {
                answers: question.answer,
                correctAnswer: question.answer[0],
                hint: question.hint,
                points: question.points || 10,
                startedBy: senderJid,
                hintSent: false,
                timeoutId: null,
                source: source
            }, 35);

            // 6. Send the image + question
            await sock.sendMessage(chatJid, {
                image: imageBuffer,
                caption: `${question.question}\n\n⏱️ Waktu: *30 detik*\n💰 Hadiah: *+${question.points || 10} poin*\n${source === '🧠 AI' ? '🧠 _Soal dibuat oleh AI — tidak akan pernah habis!_' : ''}\n\n_Langsung ketik jawabanmu di chat ini!_`
            }, { quoted: msg });

            // 7. Set hint timer (fires at 15 seconds)
            const hintTimeout = setTimeout(async () => {
                const currentSession = sessionManager.get(chatJid);
                if (currentSession && !currentSession.data.hintSent) {
                    currentSession.data.hintSent = true;
                    try {
                        await sock.sendMessage(chatJid, { 
                            text: `💡 *HINT:* ${question.hint}\n\n⏱️ Sisa waktu: *15 detik!*` 
                        });
                    } catch (e) {
                        console.error('Error sending hint:', e.message);
                    }
                }
            }, 15_000);

            // 8. Set game-over timer (fires at 30 seconds)
            const gameOverTimeout = setTimeout(async () => {
                const currentSession = sessionManager.get(chatJid);
                if (currentSession) {
                    sessionManager.destroy(chatJid);

                    // Record loss in database
                    const pushName = msg.pushName || senderJid.split('@')[0];
                    try {
                        await require('../config/db').query(
                            `INSERT INTO game_scores (sender_jid, push_name, game_type, points, losses) 
                             VALUES (?, ?, ?, 0, 1)`,
                            [senderJid, pushName, 'tebakgambar']
                        );
                    } catch (e) {
                        console.error('Error recording game loss:', e.message);
                    }

                    try {
                        await sock.sendMessage(chatJid, { 
                            text: `⏰ *WAKTU HABIS!*\n\nJawabannya adalah: *${question.answer[0]}*\n${question.hint}\n\n_Ketik !tebakgambar untuk main lagi!_` 
                        });
                    } catch (e) {
                        console.error('Error sending timeout message:', e.message);
                    }
                }
            }, 30_000);

            // 9. Store timeout IDs in session for cleanup
            sessionManager.update(chatJid, { 
                timeoutId: gameOverTimeout,
                hintTimeoutId: hintTimeout
            });

            await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});

            await saveSystemLog(chatJid, `Game Tebak Gambar dimulai! [${source}] Jawaban: "${question.answer[0]}". Pemain harus menjawab dalam 30 detik.`);

        } catch (error) {
            console.error('❌ Tebak Gambar Error:', error);
            // Cleanup session if image generation fails
            sessionManager.destroy(chatJid);
            await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
            await sock.sendMessage(chatJid, { 
                text: '❌ Gagal menyiapkan gambar. Server AI sedang sibuk, coba lagi nanti!' 
            }, { quoted: msg });
        }
    }
};

