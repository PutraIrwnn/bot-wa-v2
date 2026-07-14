module.exports = {
    name: 'menu',
    aliases: ['!menu'],
    async execute(sock, msg, chatJid, messageText) {
        const menuText = `*📜 MENU UTAMA BOT-WA 📜*

Berikut adalah daftar perintah yang bisa kamu gunakan:

💬 *AI & Chat*
• \`!ai [pertanyaan]\` 
• \`!imagine [imajinasi kamu]\` 

🖼️ *Media & Sticker*
• \`!s\` atau \`!sticker\` 
• \`!s [Pack] | [Author]\`

📥 *Downloader*
• \`!tt [Link]\`
• \`!ytmp3 [Link]\`
• \`!ytmp4 [Link]\`

🔍 *Search Engine (Baru!)*
• \`!google [Kata Kunci]\`
  _Pencarian langsung di Google._
• \`!wiki [Kata Kunci]\`
  _Mencari artikel di Wikipedia._

📰 *Informasi Terkini (Baru!)*
• \`!berita\`
  _Menampilkan 5 berita terbaru (CNN)._
• \`!jadwalbola\`
  _Menampilkan jadwal & hasil bola._
• \`!hargaemas\`
  _Cek harga emas Antam 1 Gram hari ini._
• \`!kurs [Mata Uang]\`
  _Cek nilai tukar uang (Contoh: !kurs USD)._
• \`!cuaca [Kota]\`
  _Cek info cuaca dan UV Index terkini._

🎮 *Game Interaktif*
• \`!tebakgambar\` atau \`!tg\`
  _Tebak gambar misterius dari AI! (30 detik)_
• \`!xox\` atau \`!xox @user\`
  _Main Tic-Tac-Toe vs Bot atau tantang temanmu!_

🏆 *Leaderboard & Profil*
• \`!leaderboard\` atau \`!lb\`
  _Top 10 pemain terbaik._
• \`!profile\` atau \`!stats\`
  _Lihat statistik game kamu._

ℹ️ *Informasi Bot*
• \`!info\` 
• \`!ping\``;
        
        await sock.sendMessage(chatJid, { text: menuText }, { quoted: msg });
    }
};
