const axios = require('axios');
const cheerio = require('cheerio');
const { saveSystemLog } = require('../utils/logger');

module.exports = {
    name: 'google',
    aliases: ['!google', '!g'],
    async execute(sock, msg, chatJid, messageText) {
        const query = messageText.replace(/^!(google|g)\s*/i, '').trim();
        if (!query) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan kata kunci pencarian! Contoh: !google resep nasi goreng' }, { quoted: msg });
        
        try {
            await sock.sendMessage(chatJid, { text: '🔍 Sedang mencari di Internet...' }, { quoted: msg });
            
            // Scraping Yahoo Search yang lebih pintar menjawab natural language dan link bisa dibersihkan
            const res = await axios.get(`https://id.search.yahoo.com/search?p=${encodeURIComponent(query)}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const $ = cheerio.load(res.data);
            let results = [];
            
            $('.algo').each((i, el) => {
                let title = $(el).find('h3 a').text().trim();
                let link = $(el).find('h3 a').attr('href');
                let snippet = $(el).find('.compText, .fc-falcon').text().trim();
                
                // Decode dan bersihkan link tracking Yahoo agar terlihat cantik
                if (link && link.includes('RU=')) {
                    const match = link.match(/RU=([^/]+)/);
                    if (match) {
                        link = decodeURIComponent(match[1]);
                    }
                }
                
                // Bersihkan title (Yahoo suka menggabung breadcrumb dengan title)
                if (title && title.includes(' › ')) {
                    const parts = title.split(' › ');
                    // Ambil bagian paling belakang yang biasanya adalah judul aslinya
                    title = parts[parts.length - 1].trim();
                }

                if (title && link) {
                    results.push({ title, link, snippet });
                }
            });
            
            if (results.length === 0) {
                return await sock.sendMessage(chatJid, { text: `❌ Tidak menemukan hasil apa-apa untuk "${query}".` }, { quoted: msg });
            }

            let replyText = `*🔍 HASIL PENCARIAN*\nKata kunci: _${query}_\n\n`;
            
            const topResults = results.slice(0, 3);
            for (let i = 0; i < topResults.length; i++) {
                const res = topResults[i];
                replyText += `*${i + 1}. ${res.title}*\n`;
                if(res.snippet) replyText += `${res.snippet}\n`;
                replyText += `🔗 ${res.link}\n\n`;
            }

            await sock.sendMessage(chatJid, { text: replyText.trim() }, { quoted: msg });
            await saveSystemLog(chatJid, `User melakukan pencarian web dengan keyword: "${query}".`);
            
        } catch (err) {
            console.error('Search Error:', err.message);
            await sock.sendMessage(chatJid, { text: '❌ Terjadi kesalahan saat mencari di Internet.' }, { quoted: msg });
        }
    }
};
