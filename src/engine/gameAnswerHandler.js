/**
 * Game Answer Handler
 * ===================
 * Processes incoming messages against active game sessions.
 * Separated from messageHandler.js to maintain clean separation of concerns.
 * 
 * This handler is called BEFORE command routing when an active game session
 * exists in the chat. It checks if the user's message matches the correct answer.
 */

const sessionManager = require('./sessionManager');
const db = require('../config/db');
const { getBestMove, checkWinner, renderBoard } = require('../utils/tictactoeAI');

async function handleTebakGambar(sock, msg, chatJid, messageText, senderJid, session) {
    const userAnswer = messageText.toLowerCase().trim();
    const validAnswers = session.data.answers.map(a => a.toLowerCase());

    const isCorrect = validAnswers.some(answer => userAnswer === answer || userAnswer.includes(answer));
    if (!isCorrect) return false;

    const points = session.data.points || 10;
    const pushName = msg.pushName || senderJid.split('@')[0];

    try {
        await db.query(
            `INSERT INTO game_scores (sender_jid, push_name, game_type, points, wins) VALUES (?, ?, ?, ?, 1)`,
            [senderJid, pushName, 'tebakgambar', points]
        );

        const [stats] = await db.query(
            `SELECT SUM(points) as total_points, SUM(wins) as total_wins FROM game_scores WHERE sender_jid = ?`,
            [senderJid]
        );
        const totalPoints = stats[0]?.total_points || points;
        const totalWins = stats[0]?.total_wins || 1;

        sessionManager.destroy(chatJid);
        const responseTime = ((Date.now() - session.createdAt) / 1000).toFixed(1);

        const congratsText = 
`🎉 *BENAR!* 🎉

Jawaban: *${session.data.correctAnswer}*
Dijawab oleh: *${pushName}*
⏱️ Waktu: ${responseTime} detik
💰 Poin: *+${points}*

📊 *Statistik ${pushName}:*
🏆 Total Poin: ${totalPoints}
✅ Total Menang: ${totalWins}x

_Ketik !tebakgambar untuk main lagi!_`;

        await sock.sendMessage(chatJid, { text: congratsText, mentions: [senderJid] }, { quoted: msg });
    } catch (error) {
        console.error('❌ Error handling game answer:', error);
        sessionManager.destroy(chatJid);
        await sock.sendMessage(chatJid, { 
            text: `🎉 *BENAR!* Jawabannya adalah *${session.data.correctAnswer}*!\n\n⚠️ _Tapi poin gagal disimpan, coba lagi nanti._` 
        }, { quoted: msg });
    }
    return true;
}

async function handleTicTacToe(sock, msg, chatJid, messageText, senderJid, session) {
    const data = session.data;
    const inputNum = parseInt(messageText.trim());
    
    // Cek apakah input valid (angka 1-9)
    if (isNaN(inputNum) || inputNum < 1 || inputNum > 9) return false;

    // Tentukan role sender
    let isPlayerX = senderJid === data.playerX;
    let isPlayerO = senderJid === data.playerO;
    
    // Jika bukan pemain yang terdaftar, abaikan
    if (!isPlayerX && !isPlayerO) return false;

    // Cek giliran
    if ((data.turn === 'X' && !isPlayerX) || (data.turn === 'O' && !isPlayerO)) {
        await sock.sendMessage(chatJid, { text: `⚠️ Sabar, ini giliran *${data.turn === 'X' ? data.playerXName : data.playerOName}*!` }, { quoted: msg });
        return true;
    }

    // Cek ketersediaan kotak
    const idx = inputNum - 1;
    if (data.board[idx] === 'X' || data.board[idx] === 'O') {
        await sock.sendMessage(chatJid, { text: `⚠️ Kotak nomor ${inputNum} sudah terisi! Pilih yang lain.` }, { quoted: msg });
        return true;
    }

    // Eksekusi langkah pemain
    await applyMove(sock, chatJid, session, idx, data.turn);

    return true;
}

async function applyMove(sock, chatJid, session, idx, marker) {
    const data = session.data;
    data.board[idx] = marker;

    // Cek Menang / Seri
    const winner = checkWinner(data.board);
    if (winner) {
        return await endGame(sock, chatJid, session, winner);
    }

    // Ganti giliran
    data.turn = marker === 'X' ? 'O' : 'X';
    
    // Perbarui sesi dengan memperpanjang TTL
    session.expiresAt = Date.now() + (60 * 1000); // tambah 60s
    sessionManager.update(chatJid, data);

    // Kirim pesan papan terbaru
    const nextPlayerName = data.turn === 'X' ? data.playerXName : data.playerOName;
    let boardUI = renderBoard(data.board);
    
    // JIKA giliran Bot, jalankan AI
    if (!data.isPvP && data.turn === 'O') {
        await sock.sendMessage(chatJid, { text: `${boardUI}\n\n🤖 _Bot sedang berpikir..._` });
        
        // Delay dikit biar kerasa natural
        setTimeout(async () => {
            const currentSession = sessionManager.get(chatJid);
            if (!currentSession) return;
            
            const botMove = getBestMove(currentSession.data.board, 'O', 'X');
            if (botMove !== -1) {
                await applyMove(sock, chatJid, currentSession, botMove, 'O');
            }
        }, 1500);
    } else {
        // Giliran manusia
        const mentions = [];
        if (data.turn === 'X') mentions.push(data.playerX);
        if (data.turn === 'O' && data.isPvP) mentions.push(data.playerO);

        await sock.sendMessage(chatJid, { 
            text: `${boardUI}\n\nGiliran: *${nextPlayerName} (${data.turn === 'X' ? '❌' : '⭕'})*\n_Ketik angka 1-9_`,
            mentions: mentions
        });
    }
}

async function endGame(sock, chatJid, session, result) {
    const data = session.data;
    let resultText = '';
    let winnerJid = null;
    let pushName = null;
    let points = 0;

    if (result === 'DRAW') {
        resultText = `😐 *SERI!* Tidak ada yang menang.`;
    } else {
        const isXWin = result === 'X';
        winnerJid = isXWin ? data.playerX : data.playerO;
        pushName = isXWin ? data.playerXName : data.playerOName;
        points = data.isPvP ? 20 : 15; // Menang vs Player = 20 poin, vs Bot = 15 poin

        resultText = `🎉 *${pushName}* MENANG! (+${points} Poin)`;
        
        // Simpan skor ke database
        if (winnerJid !== 'bot') {
            try {
                await db.query(
                    `INSERT INTO game_scores (sender_jid, push_name, game_type, points, wins) VALUES (?, ?, ?, ?, 1)`,
                    [winnerJid, pushName, 'tictactoe', points]
                );
            } catch (error) {
                console.error('❌ Error saving tictactoe score:', error);
            }
        }
    }

    const boardUI = renderBoard(data.board);
    sessionManager.destroy(chatJid);

    await sock.sendMessage(chatJid, { 
        text: `🎮 *GAME OVER* 🎮\n\n${boardUI}\n\n${resultText}` 
    });
}

/**
 * Handle a potential game answer from a user.
 */
async function handleGameAnswer(sock, msg, chatJid, messageText, senderJid, session) {
    if (session.gameType === 'tebakgambar') {
        return await handleTebakGambar(sock, msg, chatJid, messageText, senderJid, session);
    }
    
    if (session.gameType === 'tictactoe') {
        return await handleTicTacToe(sock, msg, chatJid, messageText, senderJid, session);
    }

    return false;
}

module.exports = { handleGameAnswer };
