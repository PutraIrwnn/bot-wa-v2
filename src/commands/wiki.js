const axios = require('axios');
const { saveSystemLog } = require('../utils/logger');

module.exports = {
    name: 'wiki',
    aliases: ['!wiki', '!wikipedia'],
    async execute(sock, msg, chatJid, messageText) {
        const query = messageText.replace(/^!(wiki|wikipedia)\s*/i, '').trim();
        if (!query) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan kata kunci! Contoh: !wiki soekarno' }, { quoted: msg });
        
        try {
            // Wikipedia mewajibkan User-Agent khusus agar request tidak ditolak (Error 403)
            const headers = { 'User-Agent': 'BotWaApp/1.0 (https://github.com/botwa)' };

            // 1. Cari judul artikel yang paling tepat (karena pencarian user kadang tidak persis)
            const searchRes = await axios.get(`https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`, { headers });
            
            if (searchRes.data.query.search.length === 0) {
                return await sock.sendMessage(chatJid, { text: `❌ Artikel tentang "${query}" tidak ditemukan di Wikipedia Indonesia.` }, { quoted: msg });
            }

            // 2. Ambil judul resmi paling relevan di urutan pertama (Misal "neymar junior" -> "Neymar")
            const title = searchRes.data.query.search[0].title;

            // 3. Ambil ringkasan artikel (Summary) menggunakan judul resmi tersebut
            const response = await axios.get(`https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, { headers });
            
            if (response.data && response.data.extract) {
                const summary = response.data.extract;
                
                const replyText = `*📚 WIKIPEDIA: ${title}*\n\n${summary}\n\n🔗 _Baca selengkapnya: https://id.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}_`;
                await sock.sendMessage(chatJid, { text: replyText }, { quoted: msg });
                await saveSystemLog(chatJid, `User membaca Wikipedia tentang: "${title}".`);
            } else {
                await sock.sendMessage(chatJid, { text: '❌ Ringkasan artikel tidak tersedia untuk topik ini.' }, { quoted: msg });
            }
        } catch (err) {
            console.error('Wiki Error:', err.message);
            await sock.sendMessage(chatJid, { text: '❌ Terjadi kesalahan saat mengambil data dari Wikipedia.' }, { quoted: msg });
        }
    }
};
