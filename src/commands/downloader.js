const { downloadTikTok, downloadYouTubeAudio, downloadYouTubeVideo } = require('../plugins/downloader');
const { saveSystemLog } = require('../utils/logger');

module.exports = {
    name: 'downloader',
    aliases: ['!tt', '!ytmp3', '!ytmp4'],
    async execute(sock, msg, chatJid, messageText) {
        // --- Command: !tt ---
        if (messageText.toLowerCase().startsWith('!tt ')) {
            const url = messageText.slice(4).trim();
            if (!url) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan link TikTok!' }, { quoted: msg });
            
            await sock.sendMessage(chatJid, { text: '⏳ Sedang memproses video TikTok...' }, { quoted: msg });
            try {
                const data = await downloadTikTok(url);
                await sock.sendMessage(chatJid, { 
                    video: { url: data.videoUrl }, 
                    caption: `🎥 *${data.title}*\n_Downloaded by Bot-Wa_` 
                }, { quoted: msg });
                
                await saveSystemLog(chatJid, `User berhasil mengunduh video TikTok berjudul "${data.title}".`);
            } catch (err) {
                await sock.sendMessage(chatJid, { text: `❌ ${err.message}` }, { quoted: msg });
            }
            return;
        }

        // --- Command: !ytmp3 ---
        if (messageText.toLowerCase().startsWith('!ytmp3 ')) {
            const url = messageText.slice(7).trim();
            if (!url) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan link YouTube!' }, { quoted: msg });
            
            await sock.sendMessage(chatJid, { text: '⏳ Sedang mengunduh audio YouTube...' }, { quoted: msg });
            try {
                const data = await downloadYouTubeAudio(url);
                await sock.sendMessage(chatJid, { 
                    audio: { url: data.streamUrl }, 
                    mimetype: 'audio/mp4' 
                }, { quoted: msg });
                
                await saveSystemLog(chatJid, `User berhasil mengunduh audio/lagu dari YouTube berjudul "${data.title}".`);
            } catch (err) {
                await sock.sendMessage(chatJid, { text: `❌ ${err.message}` }, { quoted: msg });
            }
            return;
        }

        // --- Command: !ytmp4 ---
        if (messageText.toLowerCase().startsWith('!ytmp4 ')) {
            const url = messageText.slice(7).trim();
            if (!url) return await sock.sendMessage(chatJid, { text: '⚠️ Masukkan link YouTube!' }, { quoted: msg });
            
            await sock.sendMessage(chatJid, { text: '⏳ Sedang mengunduh video YouTube...' }, { quoted: msg });
            try {
                const data = await downloadYouTubeVideo(url);
                await sock.sendMessage(chatJid, { 
                    video: { url: data.streamUrl }, 
                    caption: `🎥 *${data.title}*\n_Downloaded by Bot-Wa_` 
                }, { quoted: msg });
                
                await saveSystemLog(chatJid, `User berhasil mengunduh video dari YouTube berjudul "${data.title}".`);
            } catch (err) {
                await sock.sendMessage(chatJid, { text: `❌ ${err.message}` }, { quoted: msg });
            }
            return;
        }
    }
};
