const db = require('../config/db');

module.exports = {
    name: 'profile',
    aliases: ['!profile', '!profil', '!stats'],

    async execute(sock, msg, chatJid, messageText, senderJid) {
        try {
            await sock.sendPresenceUpdate('composing', chatJid);

            // 1. Get player's game statistics
            const [stats] = await db.query(
                `SELECT 
                    SUM(points) AS total_points,
                    SUM(wins) AS total_wins,
                    SUM(losses) AS total_losses,
                    COUNT(*) AS total_games,
                    MAX(played_at) AS last_played
                FROM game_scores
                WHERE sender_jid = ?`,
                [senderJid]
            );

            const playerStats = stats[0];

            // Check if player has any game history
            if (!playerStats || !playerStats.total_games || playerStats.total_games === 0) {
                return await sock.sendMessage(chatJid, { 
                    text: '📊 Kamu belum pernah bermain game apapun!\n\nCoba mainkan *!tebakgambar* untuk memulai petualanganmu! 🎮' 
                }, { quoted: msg });
            }

            // 2. Get player's global rank
            const [rankResult] = await db.query(
                `SELECT COUNT(*) + 1 AS player_rank
                FROM (
                    SELECT sender_jid, SUM(points) AS total 
                    FROM game_scores 
                    GROUP BY sender_jid
                ) AS rankings
                WHERE total > (
                    SELECT COALESCE(SUM(points), 0) 
                    FROM game_scores 
                    WHERE sender_jid = ?
                )`,
                [senderJid]
            );

            // 3. Get total number of players
            const [totalPlayers] = await db.query(
                `SELECT COUNT(DISTINCT sender_jid) AS total FROM game_scores`
            );

            const rank = rankResult[0]?.player_rank || '?';
            const total = totalPlayers[0]?.total || '?';
            const wins = playerStats.total_wins || 0;
            const losses = playerStats.total_losses || 0;
            const points = playerStats.total_points || 0;
            const games = playerStats.total_games || 0;
            const winRate = (wins + losses) > 0 
                ? Math.round((wins / (wins + losses)) * 100) 
                : 0;

            // 4. Determine player title based on points
            let title = '🌱 Pemula';
            if (points >= 500) title = '👑 Grandmaster';
            else if (points >= 300) title = '💎 Master';
            else if (points >= 200) title = '🔥 Expert';
            else if (points >= 100) title = '⭐ Pro';
            else if (points >= 50) title = '🎯 Amateur';

            // 5. Build visual progress bar
            const nextMilestone = points < 50 ? 50 : points < 100 ? 100 : points < 200 ? 200 : points < 300 ? 300 : points < 500 ? 500 : 1000;
            const progress = Math.min(Math.round((points / nextMilestone) * 10), 10);
            const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);

            const playerName = msg.pushName || senderJid.split('@')[0];

            const profileText = 
`*📊 PROFIL PEMAIN 📊*
━━━━━━━━━━━━━━━━━━━━━━━━

👤 *${playerName}*
🎖️ Title: *${title}*
🏅 Rank: *#${rank}* dari ${total} pemain

💰 *Total Poin:* ${points}
${progressBar} (${points}/${nextMilestone})

📈 *Statistik Game:*
├ 🎮 Total Main: ${games}x
├ ✅ Menang: ${wins}x
├ ❌ Kalah: ${losses}x
└ 📊 Win Rate: *${winRate}%*

━━━━━━━━━━━━━━━━━━━━━━━━
_Ketik !tebakgambar untuk menambah poin!_`;

            await sock.sendMessage(chatJid, { 
                text: profileText,
                mentions: [senderJid]
            }, { quoted: msg });

        } catch (error) {
            console.error('❌ Profile Error:', error);
            await sock.sendMessage(chatJid, { 
                text: '❌ Gagal memuat profil. Coba lagi nanti.' 
            }, { quoted: msg });
        } finally {
            await sock.sendPresenceUpdate('paused', chatJid).catch(() => {});
        }
    }
};
