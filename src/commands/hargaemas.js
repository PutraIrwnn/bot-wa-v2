const axios = require('axios');
const cheerio = require('cheerio');
const { saveSystemLog } = require('../utils/logger');

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID').format(angka);
}

function parseWeight(text) {
    let weight = 1; // default 1 gram
    const args = text.toLowerCase().split(' ');
    if (args.length > 1) {
        const query = args.slice(1).join('').replace(',', '.');
        const match = query.match(/([0-9.]+)\s*(kg|kilo|g|gr|gram)?/);
        if (match) {
            const num = parseFloat(match[1]);
            const unit = match[2];
            if (unit === 'kg' || unit === 'kilo') {
                weight = num * 1000;
            } else if (num > 0) {
                weight = num;
            }
        }
    }
    return weight;
}

module.exports = {
    name: 'hargaemas',
    aliases: ['!hargaemas', '!emas'],
    async execute(sock, msg, chatJid, messageText) {
        try {
            await sock.sendMessage(chatJid, { text: '🏆 Sedang mengecek harga emas Antam terkini...' }, { quoted: msg });
            
            const weight = parseWeight(messageText);
            
            // Bypass Cloudflare block dengan scrape dari harga-emas.org
            const response = await axios.get('https://harga-emas.org/', {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0 Safari/537.36' }
            });
            const $ = cheerio.load(response.data);
            const data = {};
            
            $('table').eq(2).find('tr').each((j, tr) => {
                const tds = $(tr).find('td');
                if (tds.length === 3) {
                    const b = $(tds[0]).text().trim();
                    const jHarga = $(tds[1]).text().trim().replace(/\./g, '');
                    if (b && jHarga && !isNaN(parseFloat(b))) {
                        data[parseFloat(b)] = parseInt(jHarga, 10);
                    }
                }
            });
            
            let finalPrice = null;
            let isEstimasi = false;
            
            if (data[weight]) {
                finalPrice = data[weight];
            } else {
                // Estimasi: Cari pecahan terdekat (utamakan 100g untuk base rate grosir, atau 1g)
                if (data[100]) {
                    finalPrice = (data[100] / 100) * weight;
                    isEstimasi = true;
                } else if (data[1]) {
                    finalPrice = data[1] * weight;
                    isEstimasi = true;
                }
            }
            
            if (!finalPrice) {
                await sock.sendMessage(chatJid, { text: '❌ Data harga emas tidak tersedia saat ini.' }, { quoted: msg });
                return;
            }

            const estText = isEstimasi ? ' *(Estimasi)*' : '';
            const weightLabel = weight >= 1000 ? `${weight / 1000} Kg` : `${weight} Gram`;
            
            const replyText = `*🏆 HARGA EMAS ANTAM TERKINI*\n\n*Pecahan ${weightLabel}:* Rp ${formatRupiah(finalPrice)}${estText}\n\n_Sumber: harga-emas.org_`;
            
            await sock.sendMessage(chatJid, { text: replyText }, { quoted: msg });
            await saveSystemLog(chatJid, `User mengecek harga emas Antam (${weightLabel}: Rp ${formatRupiah(finalPrice)}).`);
            
        } catch (err) {
            console.error('Emas Error:', err.message);
            await sock.sendMessage(chatJid, { text: '❌ Terjadi kesalahan saat mengambil data harga emas.' }, { quoted: msg });
        }
    }
};
