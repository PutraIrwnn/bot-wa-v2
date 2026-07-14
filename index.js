const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const { handleMessage, totalCommands } = require('./src/handlers/messageHandler');

async function connectToWhatsApp() {
    // Bersihkan layar terminal saat mulai
    console.clear();

    // 1. Initialize authentication state
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    // 2. Konfigurasi Socket (Mesin utama bot)
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }), // Matikan log bawaan yang berisik
        browser: ['Bot-Wa', 'MacOS', '1.0.0'] // Nama bot saat dilihat di HP
    });

    // 3. Event Listener: Simpan kredensial login (agar tidak scan QR terus)
    sock.ev.on('creds.update', saveCreds);

    // 4. Event Listener: Koneksi WhatsApp
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n=============================================');
            console.log('📲 SCAN QR CODE INI DI WHATSAPP KAMU');
            console.log('=============================================\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('\n❌ Koneksi terputus! Alasan:', lastDisconnect.error?.message);
            
            if (shouldReconnect) {
                console.log('🔄 Mencoba menghubungkan kembali...\n');
                connectToWhatsApp();
            } else {
                console.log('⛔ Anda telah Log Out dari WhatsApp. Silakan hapus folder "auth_info_baileys" dan jalankan ulang untuk scan QR baru.\n');
            }
        } else if (connection === 'open') {
            // Tampilan UI Terminal yang Estetik
            const cyan = '\x1b[36m';
            const green = '\x1b[32m';
            const reset = '\x1b[0m';
            const yellow = '\x1b[33m';

            console.log('');
            console.log(`${cyan}╔════════════════════════════════════════════╗${reset}`);
            console.log(`${cyan}║${reset}           ${yellow}🤖 BOT-WA INITIALIZED${reset}            ${cyan}║${reset}`);
            console.log(`${cyan}╠════════════════════════════════════════════╣${reset}`);
            console.log(`${cyan}║${reset} ${green}✅${reset} ${totalCommands} Commands Loaded                        ${cyan}║${reset}`);
            console.log(`${cyan}║${reset} ${green}✅${reset} MySQL Database Connected                 ${cyan}║${reset}`);
            console.log(`${cyan}║${reset} ${green}✅${reset} WhatsApp Socket Connected                ${cyan}║${reset}`);
            console.log(`${cyan}╚════════════════════════════════════════════╝${reset}`);
            console.log(`\n${yellow}📡 Memantau chat secara real-time...${reset}\n`);
        }
    });

    // 5. Event Listener: Menerima Pesan Masuk
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // Auto-read pesan
        if (msg.key.remoteJid) {
            await sock.readMessages([msg.key]);
        }

        // Oper semua logika perintah ke messageHandler
        await handleMessage(sock, msg);
    });
}

// Menjalankan fungsi utama
connectToWhatsApp();
