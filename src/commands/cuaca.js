const { getWeather } = require('../plugins/weather');
const { saveSystemLog } = require('../utils/logger');

module.exports = {
    name: 'cuaca',
    aliases: ['!cuaca'],
    async execute(sock, msg, chatJid, messageText) {
        const city = messageText.slice(7).trim();
        if (!city) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan nama kota! Contoh: !cuaca karawang' }, { quoted: msg });
        
        try {
            const weatherInfo = await getWeather(city);
            await sock.sendMessage(chatJid, { text: weatherInfo }, { quoted: msg });
            
            // Simpan jejak memori untuk AI
            await saveSystemLog(chatJid, `User mengecek info cuaca. Sistem memberikan laporan berikut kepada user:\n\n${weatherInfo}`);
        } catch (err) {
            await sock.sendMessage(chatJid, { text: `❌ ${err.message}` }, { quoted: msg });
        }
    }
};
