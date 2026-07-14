const axios = require('axios');
const { saveSystemLog } = require('../utils/logger');

function parseKurs(text) {
    const rawArgs = text.slice(5).trim().toLowerCase();
    if (!rawArgs) return { amount: 1, from: 'USD', to: 'IDR' };

    // Standardize aliases
    let clean = rawArgs.replace(/rupiah|rp/g, 'idr')
                       .replace(/dolar|dollar/g, 'usd')
                       .replace(/yen/g, 'jpy')
                       .replace(/euro/g, 'eur')
                       .replace(/ringgit/g, 'myr')
                       .replace(/riyal/g, 'sar')
                       .replace(/ke|to/g, '-');
                       
    // Clean spaces around '-'
    clean = clean.replace(/\s*-\s*/g, '-');

    // Match format: [amount] [from]-[to] or [amount] [from] or [from]-[to] or [from]
    const regex = /^([0-9.,]+)?\s*([a-z]+)(?:-([a-z]+))?$/;
    const match = clean.match(regex);

    let amount = 1;
    let from = 'USD';
    let to = 'IDR';

    if (match) {
        if (match[1]) {
            let numStr = match[1].replace(/\./g, '').replace(/,/g, '.');
            amount = parseFloat(numStr) || 1;
        }
        
        from = match[2].toUpperCase();
        
        if (match[3]) {
            to = match[3].toUpperCase();
        } else {
            if (from === 'IDR') {
                to = 'USD'; 
            } else {
                to = 'IDR'; 
            }
        }
    } else {
        const parts = clean.split(' ');
        if (parts.length === 1) from = parts[0].toUpperCase();
    }

    return { amount, from, to };
}

module.exports = {
    name: 'kurs',
    aliases: ['!kurs'],
    async execute(sock, msg, chatJid, messageText) {
        
        const { amount, from, to } = parseKurs(messageText);
        
        try {
            await sock.sendMessage(chatJid, { text: `💱 Mengecek nilai tukar ${amount} ${from} ke ${to}...` }, { quoted: msg });
            
            const response = await axios.get(`https://open.er-api.com/v6/latest/${from}`);
            
            if (response.data && response.data.result === 'success') {
                const rates = response.data.rates;
                if (!rates[to]) {
                    return await sock.sendMessage(chatJid, { text: `❌ Gagal menemukan rate mata uang tujuan (${to}).` }, { quoted: msg });
                }

                const rate = rates[to];
                const converted = amount * rate;

                const formatCurrency = (val, cur) => {
                    try {
                        return new Intl.NumberFormat('id-ID', { 
                            style: 'currency', 
                            currency: cur,
                            maximumFractionDigits: 2 
                        }).format(val);
                    } catch(e) {
                        return `${val} ${cur}`;
                    }
                };
                
                const formattedFrom = formatCurrency(amount, from);
                const formattedTo = formatCurrency(converted, to);
                const dateUpdate = new Date(response.data.time_last_update_unix * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
                
                const replyText = `*💱 INFORMASI KURS TERKINI*\n\n${formattedFrom} = *${formattedTo}*\n\n_(Rate: 1 ${from} = ${rate} ${to})_\n_Update: ${dateUpdate} WIB_`;
                await sock.sendMessage(chatJid, { text: replyText }, { quoted: msg });
                
                await saveSystemLog(chatJid, `User mengecek kurs: ${formattedFrom} = ${formattedTo}.`);
            } else {
                await sock.sendMessage(chatJid, { text: `❌ Mata uang asal "${from}" tidak ditemukan atau tidak valid.` }, { quoted: msg });
            }
        } catch (err) {
            console.error('Kurs Error:', err.message);
            await sock.sendMessage(chatJid, { text: `❌ Terjadi kesalahan saat mengambil data kurs.` }, { quoted: msg });
        }
    }
};
