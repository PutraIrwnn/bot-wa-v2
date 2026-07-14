const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createWhatsAppSticker } = require('../plugins/sticker');
const { saveSystemLog } = require('../utils/logger');

module.exports = {
    name: 'sticker',
    aliases: ['!s', '!sticker'],
    async execute(sock, msg, chatJid, messageText) {
        // Ambil pesan asli atau pesan yang di-reply
        const isQuoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;

        // Cek apakah pesan target adalah image atau video
        const isImage = !!targetMessage.imageMessage;
        const isVideo = !!targetMessage.videoMessage;

        if (isImage || isVideo) {
            await sock.sendMessage(chatJid, { text: '⏳ Sedang membuat stiker, mohon tunggu...' }, { quoted: msg });
            
            try {
                // Tampilkan indikator "Sedang mengetik"
                await sock.sendPresenceUpdate('composing', chatJid);
                
                // 1. Download media
                let mediaMsg;
                if (isQuoted) {
                    const quotedType = Object.keys(targetMessage)[0];
                    mediaMsg = { message: { [quotedType]: targetMessage[quotedType] } };
                } else {
                    mediaMsg = msg;
                }
                
                const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {}, { 
                    reuploadRequest: sock.updateMediaMessage 
                });

                // 2. Cek Exif (Nama Pack | Nama Author) dari teks setelah command
                let packName = 'Bot-Wa';
                let authorName = 'By Putra';
                
                const rawArgs = messageText.replace(/^!(s|sticker)\s*/i, '').trim();
                if (rawArgs.length > 0) {
                    const splitArgs = rawArgs.split('|');
                    if (splitArgs[0]) packName = splitArgs[0].trim();
                    if (splitArgs[1]) authorName = splitArgs[1].trim();
                    else authorName = 'Bot-Wa'; // Kalau user cuma masukin 1 parameter
                }

                // 3. Konversi ke stiker WebP
                const stickerBuffer = await createWhatsAppSticker(buffer, packName, authorName);

                // 4. Kirim stiker
                await sock.sendMessage(chatJid, { sticker: stickerBuffer }, { quoted: msg });
                await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
                
                await saveSystemLog(chatJid, `User baru saja membuat Stiker WhatsApp dengan nama pack "${packName}" dan author "${authorName}".`);
                
            } catch (error) {
                console.error('❌ Error membuat stiker:', error);
                await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
                await sock.sendMessage(chatJid, { text: '❌ Gagal membuat stiker. ' + (error.message || 'Coba gunakan gambar atau video (maks 10 detik) yang valid.') }, { quoted: msg });
            }
        } else {
            // Jika tidak ada gambar/video
            await sock.sendMessage(chatJid, { text: '⚠️ Kirim gambar/video dengan caption *!s* atau balas (reply) gambar/video yang sudah ada dengan *!s*.' }, { quoted: msg });
        }
    }
};
