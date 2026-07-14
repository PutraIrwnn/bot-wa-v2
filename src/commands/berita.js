const Parser = require('rss-parser');
const parser = new Parser();
const { saveSystemLog } = require('../utils/logger');

// Kata hubung/slang yang sering merusak hasil pencarian (Stopwords)
const stopwords = ['yg', 'yang', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau', 'bilang', 'kata', 'mengatakan', 'itu', 'ini', 'tersebut', 'oleh', 'ada', 'adalah', 'tentang', 'buat', 'si', 'para'];

module.exports = {
    name: 'berita',
    aliases: ['!berita'],
    async execute(sock, msg, chatJid, messageText) {
        const query = messageText.replace(/^!berita\s*/i, '').trim();

        try {
            if (!query) {
                // Jika tidak ada kata kunci, ambil berita umum terkini dari CNN
                await sock.sendMessage(chatJid, { text: '📰 Sedang mengambil berita nasional terbaru...' }, { quoted: msg });
                
                const feed = await parser.parseURL('https://www.cnnindonesia.com/nasional/rss');
                
                if (!feed.items || feed.items.length === 0) {
                    return await sock.sendMessage(chatJid, { text: '❌ Tidak dapat mengambil berita saat ini.' }, { quoted: msg });
                }

                let replyText = `*📰 TOP 5 BERITA NASIONAL TERKINI*\n\n`;
                const topNews = feed.items.slice(0, 5);
                for (let i = 0; i < topNews.length; i++) {
                    const item = topNews[i];
                    replyText += `*${i + 1}. ${item.title}*\n`;
                    replyText += `🔗 ${item.link}\n\n`;
                }

                await sock.sendMessage(chatJid, { text: replyText.trim() }, { quoted: msg });
                await saveSystemLog(chatJid, `User mengecek top 5 berita nasional terkini.`);
            } else {
                // Filter query agar lebih mudah dibaca mesin pencari
                const cleanQuery = query.toLowerCase().split(' ')
                    .filter(w => !stopwords.includes(w))
                    .join(' ');
                
                // Jika hasil filter kosong, gunakan query asli
                const finalQuery = cleanQuery || query;

                // Pencarian Berita Menggunakan Bing News RSS
                await sock.sendMessage(chatJid, { text: `📰 Sedang mencari berita tentang: "${query}"...` }, { quoted: msg });
                
                const feed = await parser.parseURL(`https://www.bing.com/news/search?q=${encodeURIComponent(finalQuery)}&format=rss`);
                
                if (!feed.items || feed.items.length === 0) {
                    return await sock.sendMessage(chatJid, { text: `❌ Tidak menemukan berita yang relevan dengan pencarian "${query}". Coba gunakan kata kunci yang lebih singkat.` }, { quoted: msg });
                }

                let replyText = `*🔍 PENCARIAN BERITA*\nTopik: _${query}_\n\n`;
                
                const topResults = feed.items.slice(0, 4);
                for (let i = 0; i < topResults.length; i++) {
                    const res = topResults[i];
                    replyText += `*${i + 1}. ${res.title}*\n`;
                    // Hilangkan karakter aneh jika ada
                    const snippet = res.contentSnippet ? res.contentSnippet.trim() : '';
                    if (snippet) replyText += `${snippet}\n`;
                    replyText += `🔗 ${res.link}\n\n`;
                }

                await sock.sendMessage(chatJid, { text: replyText.trim() }, { quoted: msg });
                await saveSystemLog(chatJid, `User mencari berita dengan kata kunci: "${query}".`);
            }
        } catch (err) {
            console.error('Berita Error:', err.message);
            await sock.sendMessage(chatJid, { text: '❌ Gagal mengambil berita.' }, { quoted: msg });
        }
    }
};
