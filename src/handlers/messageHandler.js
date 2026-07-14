const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const rateLimiter = require('../engine/rateLimiter');
const sessionManager = require('../engine/sessionManager');
const { handleGameAnswer } = require('../engine/gameAnswerHandler');
const { logChat } = require('../utils/logger');

// Muat semua file command secara dinamis saat bot menyala
const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const cmd = require(`../commands/${file}`);
    commands.push(cmd);
}

// Commands loaded

async function handleMessage(sock, msg) {
    if (!msg.message) return;
    
    const messageType = Object.keys(msg.message)[0];
    if (messageType === 'protocolMessage') return; // Ignore internal WhatsApp messages

    const messageText = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || 
                        msg.message.videoMessage?.caption || "";

    const chatJid = msg.key.remoteJid;
    const senderJid = msg.key.participant || chatJid;
    const isGroup = chatJid.endsWith('@g.us');

    // Abaikan pesan kosong
    if (!messageText) return;

    // Monitor Live Chat ke Terminal
    if (msg.key.fromMe) {
        logChat('Bot-Wa', isGroup, messageText, true);
        return; // Hentikan proses, jangan merespon pesan sendiri
    } else {
        const senderName = msg.pushName || senderJid.split('@')[0];
        logChat(senderName, isGroup, messageText, false);
    }

    // --- Simpan Pesan User ke Database ---
    // Hanya simpan jika itu adalah command
    const isCommand = messageText.startsWith('!');
    if (isCommand) {
        try {
            const msgId = msg.key.id;
            const [existing] = await db.query('SELECT 1 FROM chat_logs WHERE message_id = ?', [msgId]);
            if (existing.length === 0) {
                await db.query('INSERT INTO chat_logs (message_id, chat_jid, sender_jid, role, message) VALUES (?, ?, ?, ?, ?)', [msgId, chatJid, senderJid, 'user', messageText]);
            }
        } catch (err) {
            console.error('Error saving chat log:', err);
        }
    }

    // --- 🎮 Game Answer Listener (BEFORE command routing) ---
    // If there's an active game session and the message is NOT a command,
    // check if it's a valid game answer.
    const activeSession = sessionManager.get(chatJid);
    if (activeSession && !isCommand) {
        const handled = await handleGameAnswer(sock, msg, chatJid, messageText, senderJid, activeSession);
        if (handled) return; // Answer was processed, skip command routing
    }

    // --- Dynamic Command Routing ---
    for (const cmd of commands) {
        for (const alias of cmd.aliases) {
            // Cocokkan command dengan awalan string atau sama persis
            if (messageText.toLowerCase() === alias || messageText.toLowerCase().startsWith(alias + ' ')) {
                
                // --- 🛡️ Rate Limiter Check ---
                const rateCheck = rateLimiter.check(senderJid, cmd.name, cmd.rateLimit);
                if (!rateCheck.allowed) {
                    const waitSec = Math.ceil(rateCheck.retryAfterMs / 1000);
                    await sock.sendMessage(chatJid, { 
                        text: `⏳ Sabar ya, kamu terlalu sering memakai perintah ini.\nCoba lagi dalam *${waitSec} detik*.` 
                    }, { quoted: msg });
                    return;
                }

                try {
                    await cmd.execute(sock, msg, chatJid, messageText, senderJid);
                    return; // Hentikan perulangan jika command sudah dieksekusi
                } catch (err) {
                    console.error(`Error executing ${alias}:`, err);
                }
            }
        }
    }
}

module.exports = { handleMessage, totalCommands: commands.length };
