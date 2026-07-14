const sessionManager = require('../engine/sessionManager');
const { renderBoard } = require('../utils/tictactoeAI');

module.exports = {
    name: 'xox',
    aliases: ['!xox', '!tictactoe'],
    rateLimit: { maxRequests: 5, windowMs: 60_000 }, // 5x per menit
    
    async execute(sock, msg, chatJid, messageText, senderJid) {
        // 1. Cek apakah ada game yang sedang berjalan di chat ini
        if (sessionManager.has(chatJid)) {
            return await sock.sendMessage(chatJid, { 
                text: '⚠️ Masih ada game yang berjalan di sini! Selesaikan dulu atau tunggu waktu habis.' 
            }, { quoted: msg });
        }

        // 2. Cek apakah ada user yang dimention (untuk mode PvP)
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let opponentJid = 'bot'; // Default lawan adalah bot
        let opponentName = '🤖 Bot AI';
        
        if (mentionedJid.length > 0) {
            opponentJid = mentionedJid[0];
            // Tidak bisa menantang diri sendiri
            if (opponentJid === senderJid) {
                return await sock.sendMessage(chatJid, { text: '⚠️ Kamu tidak bisa menantang dirimu sendiri!' }, { quoted: msg });
            }
            opponentName = `@${opponentJid.split('@')[0]}`;
        }

        const senderName = msg.pushName || senderJid.split('@')[0];
        
        // 3. Inisialisasi Papan 
        const initialBoard = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

        // 4. Daftarkan Sesi (TTL: 60 detik)
        sessionManager.create(chatJid, 'tictactoe', {
            board: initialBoard,
            playerX: senderJid, // Penantang selalu jalan pertama (X)
            playerO: opponentJid, // Lawan (O)
            playerXName: senderName,
            playerOName: opponentJid === 'bot' ? opponentName : `Pemain 2`,
            turn: 'X', // Giliran dimulai dari X
            isPvP: opponentJid !== 'bot'
        }, 60);

        // 5. Render papan awal
        const boardUI = renderBoard(initialBoard);
        
        const introText = 
`🎮 *TIC-TAC-TOE (XOX)* 🎮

⚔️ *${senderName} (❌)* vs *${opponentName} (⭕)*

${boardUI}

Giliran: *${senderName} (❌)*
_Ketik angka *1-9* di chat ini untuk jalan!_`;

        await sock.sendMessage(chatJid, { 
            text: introText,
            mentions: opponentJid !== 'bot' ? [opponentJid] : []
        }, { quoted: msg });
    }
};
