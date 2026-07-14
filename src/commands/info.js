module.exports = {
    name: 'info',
    aliases: ['!info'],
    async execute(sock, msg, chatJid, messageText) {
        const infoText = `*🤖 INFORMASI BOT-WA 🤖*

Halo! Saya adalah Bot WhatsApp cerdas yang diciptakan oleh *Putra*.

*🚀 Apa saja yang bisa saya lakukan?*

💬 *AI & Kreativitas*
✨ Mengobrol pintar layaknya teman virtual yang hangat (\`!ai\`)
✨ Menghasilkan gambar dari teks dengan AI (\`!imagine\`)
✨ Menyulap gambar/video menjadi stiker WhatsApp (\`!sticker\`)

🔍 *Pencarian & Informasi*
✨ Pencarian Google & Wikipedia (\`!google\`, \`!wiki\`)
✨ Berita terkini, cuaca, harga emas, kurs mata uang
✨ Jadwal sepakbola real-time multi-timezone (WIB/WITA/WIT)

📥 *Media Downloader*
✨ Download video TikTok, YouTube (MP3 & MP4)

🎮 *Game Interaktif*
✨ Tebak Gambar dari AI dengan timer 30 detik (\`!tebakgambar\`)
✨ Tic-Tac-Toe Multiplayer (PvP) & PvBot (\`!xox\`)
✨ Sistem poin, leaderboard, dan profil pemain (\`!profile\`)

🛡️ *Sistem Cerdas*
✨ Anti-spam Rate Limiter otomatis di setiap perintah
✨ Session Manager untuk game real-time
✨ AI Memory — bot mengingat percakapan sebelumnya

*📊 Total Fitur:* 17 commands aktif
*⚡ Engine:* Baileys + Gemini AI + MySQL

Ketik *!menu* untuk melihat daftar lengkap perintah.`;
        await sock.sendMessage(chatJid, { text: infoText }, { quoted: msg });
    }
};
