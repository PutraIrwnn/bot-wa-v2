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
            
            // 1. Parsing Input
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
            
            // 4. Kirim Balasan (Transport Protocol)
            if (payload) {
                try {
                    await this.sock.sendMessage(msg.key.remoteJid, payload, { quoted: msg });
                } catch (err) {
                    this.logger.error('Gagal mengirim pesan WhatsApp', err);
                }
            }
        });
    }
}

module.exports = WhatsAppAdapter;
