const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const Logger = require('../../engine/core/Logger');

class WhatsAppAdapter {
    constructor(commandRouter, actionEngine, messageAdapter) {
        this.commandRouter = commandRouter;
        this.actionEngine = actionEngine;
        this.messageAdapter = messageAdapter;
        this.logger = new Logger('WhatsApp');
        this.sock = null;
        
        // Idempotency & Retry configurations
        this.processedMessages = []; // simple array for bounded LRU cache
        this.MAX_CACHE_SIZE = 100;
        
        // Bounded retry queue for outgoing messages
        this.messageQueue = [];
        this.MAX_QUEUE_SIZE = 50;
        this.isProcessingQueue = false;
    }

    // Process background queue with backoff
    async processQueue() {
        if (this.isProcessingQueue) return;
        this.isProcessingQueue = true;

        while (this.messageQueue.length > 0) {
            const task = this.messageQueue[0]; // peek
            
            try {
                if (this.sock) {
                    await this.sock.sendMessage(task.jid, task.payload, { quoted: task.quoted });
                } else {
                    throw new Error('Socket not ready');
                }
                // Sukses
                this.messageQueue.shift(); 
            } catch (err) {
                task.attempts++;
                this.logger.warn(`Gagal mengirim pesan ke ${task.jid}. Percobaan: ${task.attempts}/${task.maxRetries}`, err);
                
                if (task.attempts >= task.maxRetries) {
                    this.logger.error(`Pesan ke ${task.jid} didrop setelah ${task.maxRetries} kegagalan.`);
                    this.messageQueue.shift(); // Drop message
                } else {
                    // Exponential backoff
                    const backoffMs = Math.pow(2, task.attempts) * 1000;
                    await new Promise(res => setTimeout(res, backoffMs));
                    // Break while loop to allow other processes? No, just wait and retry.
                    // To prevent blocking entirely, we break and re-schedule
                    this.isProcessingQueue = false;
                    setTimeout(() => this.processQueue(), backoffMs);
                    return;
                }
            }
        }
        this.isProcessingQueue = false;
    }

    queueMessage(jid, payload, quoted) {
        if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
            this.logger.error(`Antrean pesan penuh (max ${this.MAX_QUEUE_SIZE}). Pesan ke ${jid} didrop.`);
            return;
        }
        this.messageQueue.push({ jid, payload, quoted, attempts: 0, maxRetries: 3 });
        this.processQueue();
    }

    isDuplicate(msgId) {
        if (!msgId) return false;
        if (this.processedMessages.includes(msgId)) {
            return true;
        }
        this.processedMessages.push(msgId);
        if (this.processedMessages.length > this.MAX_CACHE_SIZE) {
            this.processedMessages.shift(); // Hapus yang paling lama
        }
        return false;
    }

    async connect() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

        this.sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }) // Matikan log Baileys yang berisik
        });

        // Tangani event koneksi
        this.sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                this.logger.info('Scan QR Code berikut untuk login WhatsApp:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
                this.logger.warn('Connection closed.', { reason: lastDisconnect.error, reconnect: shouldReconnect });
                
                if (shouldReconnect) {
                    this.connect(); // Rekoneksi
                }
            } else if (connection === 'open') {
                this.logger.info('✅ Terhubung ke WhatsApp!');
            }
        });

        // Simpan sesi
        this.sock.ev.on('creds.update', saveCreds);

        // Tangani pesan masuk
        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const text = this.messageAdapter.extractText(msg);
            const senderId = this.messageAdapter.extractSenderId(msg.key.remoteJid);
            
            // 1a. Idempotency Check (Duplicate message protection)
            if (this.isDuplicate(msg.key.id)) {
                this.logger.info(`Pesan duplikat diabaikan: ${msg.key.id}`);
                return;
            }
            
            // 1b. Parsing Input
            const intent = this.commandRouter.parse(text, senderId);
            if (!intent) return; // Bukan command

            this.logger.info(`Menerima perintah: ${intent.command}`, { sender: senderId });

            // Set status typing
            try { await this.sock.sendPresenceUpdate('composing', msg.key.remoteJid); } catch(e){}

            // 2. Eksekusi Action Engine
            const actionResult = await this.actionEngine.handleAction(intent);

            // Matikan status typing
            try { await this.sock.sendPresenceUpdate('paused', msg.key.remoteJid); } catch(e){}

            // 3. Format Response
            const payload = this.messageAdapter.formatResponse(actionResult);
            
            // 4. Kirim Balasan (Melalui antrean dengan retry)
            if (payload) {
                this.queueMessage(msg.key.remoteJid, payload, msg);
            }
        });
    }
}

module.exports = WhatsAppAdapter;
