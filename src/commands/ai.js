const db = require('../config/db');
const { askGemini } = require('../plugins/ai');

module.exports = {
    name: 'ai',
    aliases: ['!ai'],
    async execute(sock, msg, chatJid, messageText, senderJid) {
        const prompt = messageText.slice(4).trim();
        if (!prompt) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan pertanyaan untuk AI!' }, { quoted: msg });

        try {
            await sock.sendPresenceUpdate('composing', chatJid);
            
            // 1. Ambil history (memori) obrolan sebelumnya + log sistem
            const [historyRows] = await db.query(
                'SELECT sender_jid, role, message FROM chat_logs WHERE chat_jid = ? ORDER BY created_at DESC LIMIT 10',
                [chatJid]
            );
            
            // 2. Balik urutan dari terlama -> terbaru
            const historyContext = historyRows.reverse();

            // 3. Tanyakan ke Gemini beserta history-nya
            const aiResponse = await askGemini(prompt, historyContext);
            
            // 4. Kirim balasan AI
            await sock.sendMessage(chatJid, { text: aiResponse }, { quoted: msg });

            // 5. Simpan balasan AI ke database
            const aiMsgId = 'AI-' + Date.now();
            await db.query(
                'INSERT INTO chat_logs (message_id, chat_jid, sender_jid, role, message) VALUES (?, ?, ?, ?, ?)',
                [aiMsgId, chatJid, 'gemini', 'ai', aiResponse]
            );

        } catch (error) {
            console.error('❌ AI Error:', error);
            await sock.sendMessage(chatJid, { text: '⚠️ Maaf, AI sedang pusing. Coba lagi nanti!' }, { quoted: msg });
        } finally {
            await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
        }
    }
};
