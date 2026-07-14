const db = require('../config/db');

module.exports = {
    name: 'leaderboard',
    aliases: ['!leaderboard', '!lb', '!top'],

    async execute(sock, msg, chatJid, messageText, senderJid) {
        try {
            await sock.sendPresenceUpdate('composing', chatJid);

            // Auto-update push_name in DB for the requesting user (keeps names fresh)
            const currentPushName = msg.pushName;
            if (currentPushName && senderJid) {
                await db.query(
                    `UPDATE game_scores SET push_name = ? WHERE sender_jid = ? AND (push_name IS NULL OR push_name != ?)`,
                    [currentPushName, senderJid, currentPushName]
                ).catch(() => {}); // Silent fail — non-critical
            }

            // Query: Top 10 players by total points
            const [rows] = await db.query(
                `SELECT 
                    sender_jid,
                    SUM(points) AS total_points,
                    SUM(wins) AS total_wins,
                    SUM(losses) AS total_losses,
                    COUNT(*) AS total_games,
                    (SELECT gs2.push_name FROM game_scores gs2 
                     WHERE gs2.sender_jid = game_scores.sender_jid 
                     AND gs2.push_name IS NOT NULL 
                     ORDER BY gs2.played_at DESC LIMIT 1) AS display_name
                FROM game_scores
                GROUP BY sender_jid
                ORDER BY total_points DESC
                LIMIT 10`
            );

            if (rows.length === 0) {
                return await sock.sendMessage(chatJid, { 
                    text: '🏆 Belum ada data pemain! Mainkan *!tebakgambar* untuk memulai.' 
                }, { quoted: msg });
            }

            // Medal emojis for top 3
            const medals = ['🥇', '🥈', '🥉'];

            let leaderboardText = `*🏆 LEADERBOARD TOP 10 🏆*\n`;
            leaderboardText += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            for (let i = 0; i < rows.length; i++) {
                const player = rows[i];
                const rank = i < 3 ? medals[i] : `${i + 1}.`;
                
                // Use real-time pushName for the requesting user, DB name for others
                let playerName;
                if (player.sender_jid === senderJid && currentPushName) {
                    playerName = currentPushName;
                } else {
                    playerName = player.display_name || player.sender_jid.split('@')[0];
                }

                const wins = player.total_wins || 0;
                const losses = player.total_losses || 0;
                const winRate = (wins + losses) > 0 
                    ? Math.round((wins / (wins + losses)) * 100) 
                    : 0;

                leaderboardText += `${rank} *${playerName}*\n`;
                leaderboardText += `   💰 ${player.total_points} poin │ ✅ ${wins}W - ❌ ${losses}L │ 📊 ${winRate}%\n\n`;
            }

            leaderboardText += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            leaderboardText += `_Ketik !profile untuk lihat statistik pribadi_`;

            await sock.sendMessage(chatJid, { text: leaderboardText }, { quoted: msg });

        } catch (error) {
            console.error('❌ Leaderboard Error:', error);
            await sock.sendMessage(chatJid, { 
                text: '❌ Gagal memuat leaderboard. Coba lagi nanti.' 
            }, { quoted: msg });
        } finally {
            await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
        }
    }
};
