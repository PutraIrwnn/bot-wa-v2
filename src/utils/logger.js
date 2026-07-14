const db = require('../config/db');

/**
 * Menyimpan log sistem ke dalam memori database (chat_logs)
 * agar AI (Gemini) mengetahui konteks aktivitas bot.
 * 
 * @param {string} chatJid - ID chat tujuan
 * @param {string} contextText - Teks aktivitas yang akan disimpan
 */
async function saveSystemLog(chatJid, contextText) {
    try {
        const msgId = 'SYS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        await db.query('INSERT INTO chat_logs (message_id, chat_jid, sender_jid, role, message) VALUES (?, ?, ?, ?, ?)', [msgId, chatJid, 'system', 'system', contextText]);
    } catch (err) {
        console.error('Error saving system log:', err);
    }
}

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
};

/**
 * Mencetak log chat ke terminal dengan warna
 */
function logChat(name, isGroup, text, isBot = false) {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const chatType = isGroup ? 'Group' : 'Private';
    
    // Potong teks jika terlalu panjang
    let cleanText = text.replace(/\n/g, ' ');
    if (cleanText.length > 100) cleanText = cleanText.substring(0, 100) + '...';

    const colorName = isBot ? colors.magenta : colors.green;
    const prefix = isBot ? '🤖' : '👤';
    const textColor = isBot ? colors.yellow : (cleanText.startsWith('!') ? colors.cyan : colors.reset);
    
    console.log(`${colors.gray}[${time}]${colors.reset} ${prefix} ${colorName}${name}${colors.reset} ${colors.gray}(${chatType})${colors.reset} 💬 ${textColor}"${cleanText}"${colors.reset}`);
}

module.exports = { saveSystemLog, logChat };
