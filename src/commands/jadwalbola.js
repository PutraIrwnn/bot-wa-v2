const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();
const { saveSystemLog } = require('../utils/logger');

const stopwords = ['yg', 'yang', 'di', 'ke', 'dari', 'pada', 'dalam', 'untuk', 'dengan', 'dan', 'atau', 'bilang', 'kata', 'mengatakan', 'itu', 'ini', 'tersebut', 'oleh', 'ada', 'adalah', 'tentang', 'buat', 'si', 'para'];

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function convertToIndoTime(timestampStr) {
    if (!timestampStr) return "Waktu TBD";
    let date;
    if (timestampStr.endsWith("Z")) {
        date = new Date(timestampStr);
    } else {
        date = new Date(timestampStr + "Z"); // Anggap UTC
    }
    if (isNaN(date)) return timestampStr;
    
    const formatTime = (d) => `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`;
    
    const wib = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    const wita = new Date(date.getTime() + (8 * 60 * 60 * 1000));
    const wit = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    
    return `${formatTime(wib)} WIB / ${formatTime(wita)} WITA / ${formatTime(wit)} WIT`;
}

function convertHtmlTimeToIndo(dateStr, timeStr) {
    const timeRegex = /(\d{1,2}):(\d{2})(am|pm)/i;
    const match = timeStr.match(timeRegex);
    if (!match) return timeStr;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    let fullYear = dateStr.split(" ")[2];
    if (fullYear && fullYear.length === 2) fullYear = "20" + fullYear;
    const monthDay = dateStr.split(" ").slice(0, 2).join(" ");
    
    const dateObj = new Date(`${monthDay} ${fullYear} ${hours}:${minutes}:00 UTC`);
    if (isNaN(dateObj)) return timeStr;

    const formatTime = (d) => `${String(d.getUTCHours()).padStart(2, '0')}.${String(d.getUTCMinutes()).padStart(2, '0')}`;
    
    const wib = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
    const wita = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000));
    const wit = new Date(dateObj.getTime() + (9 * 60 * 60 * 1000));
    
    return `${formatTime(wib)} WIB / ${formatTime(wita)} WITA / ${formatTime(wit)} WIT`;
}

module.exports = {
    name: 'jadwalbola',
    aliases: ['!jadwalbola', '!bola'],
    async execute(sock, msg, chatJid, messageText) {
        let query = messageText.replace(/^!(jadwalbola|bola)\s*/i, '').trim();
        const lowerQuery = query.toLowerCase();
        
        try {
            await sock.sendMessage(chatJid, { text: '⚽ Sedang menyusun data sepakbola...' }, { quoted: msg });

            // 1. Coba Ambil Jadwal Terstruktur dari API TheSportsDB
            let targetDate = new Date();
            let timeContext = "hari ini";
            if (lowerQuery.includes('besok')) { targetDate.setDate(targetDate.getDate() + 1); timeContext = "besok"; }
            else if (lowerQuery.includes('lusa')) { targetDate.setDate(targetDate.getDate() + 2); timeContext = "lusa"; }
            else if (lowerQuery.includes('kemarin')) { targetDate.setDate(targetDate.getDate() - 1); timeContext = "kemarin"; }
            
            const dateStr = formatDate(targetDate);
            let hasSchedule = false;
            let filterWords = lowerQuery.replace(/(hari ini|besok|lusa|kemarin|jadwal|bola)/g, '').trim();
            if (filterWords.includes('piala dunia')) filterWords = 'world cup';
            
            // HOTFIX: Bypass API Cache untuk Piala Dunia
            if (filterWords === 'world cup') {
                try {
                    const cheerio = require('cheerio');
                    const htmlRes = await axios.get('https://www.thesportsdb.com/league/4429-fifa-world-cup');
                    const $ = cheerio.load(htmlRes.data);
                    
                    const d1 = new Date(targetDate);
                    const d2 = new Date(targetDate);
                    d2.setDate(d2.getDate() - 1); // Toleransi zona waktu (Jam 9 PM UTC = Besok pagi WIB)
                    
                    const format1 = `${d1.getDate()} ${d1.toLocaleString('en-US', { month: 'short' })} ${String(d1.getFullYear()).slice(2)}`;
                    const format2 = `${d2.getDate()} ${d2.toLocaleString('en-US', { month: 'short' })} ${String(d2.getFullYear()).slice(2)}`;
                    
                    let replyText = `*⚽ JADWAL PIALA DUNIA ${timeContext.toUpperCase()} ADALAH :*\n\n`;
                    let matchedEvents = [];
                    
                    $('tr').each((i, el) => {
                        const dateText = $(el).find('td').eq(0).text().trim().toLowerCase();
                        if (dateText === format1.toLowerCase() || dateText === format2.toLowerCase()) {
                            const home = $(el).find('td').eq(1).find('.team-fixture-name-full').text().trim() || $(el).find('td').eq(1).text().trim().replace(/([a-zA-Z]+)\1/g, '$1');
                            const rawTime = $(el).find('td').eq(2).text().trim();
                            const time = convertHtmlTimeToIndo(dateText, rawTime);
                            const away = $(el).find('td').eq(3).find('.team-fixture-name-full').text().trim() || $(el).find('td').eq(3).text().trim().replace(/([a-zA-Z]+)\1/g, '$1');
                            const href = $(el).find('td').eq(1).find('a').attr('href');
                            
                            if (home && away) {
                                matchedEvents.push({ home, away, time, href });
                            }
                        }
                    });
                    
                    if (matchedEvents.length > 0) {
                        for (const ev of matchedEvents) {
                            let stadium = "Stadion TBD";
                            if (ev.href && ev.href.includes('/event/')) {
                                try {
                                    const eventId = ev.href.split('/event/')[1].split('-')[0];
                                    const apiRes = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${eventId}`);
                                    if (apiRes.data && apiRes.data.events && apiRes.data.events[0].strVenue) {
                                        stadium = apiRes.data.events[0].strVenue;
                                    }
                                } catch(e) {}
                            }
                            replyText += `${ev.home} vs ${ev.away} : ${ev.time} (${stadium}) \nReferee : (Data belum tersedia)\n\n`;
                        }
                        
                        await sock.sendMessage(chatJid, { text: replyText.trim() }, { quoted: msg });
                        return; // Selesai!
                    }
                } catch(e) {
                    console.error("Scraper Error:", e.message);
                }
            }
            
            try {
                const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`);
                if (res.data && res.data.events) {
                    let events = res.data.events;
                    
                    if (filterWords && filterWords !== 'world cup') {
                        events = events.filter(e => {
                            const matchStr = `${e.strLeague} ${e.strHomeTeam} ${e.strAwayTeam}`.toLowerCase();
                            const keywords = filterWords.split(' ').filter(w => !stopwords.includes(w) && w.length > 2);
                            if(keywords.length === 0) return true;
                            return keywords.some(kw => matchStr.includes(kw));
                        });
                    }

                    if (events.length > 0) {
                        hasSchedule = true;
                        
                        let titleContext = filterWords ? filterWords : "Bola";
                        let replyText = `*⚽ JADWAL ${titleContext.toUpperCase()} ${timeContext.toUpperCase()} ADALAH :*\n\n`;
                        
                        const limit = Math.min(events.length, 15);
                        for (let i = 0; i < limit; i++) {
                            const e = events[i];
                            const timeWib = convertToIndoTime(e.strTimestamp);
                            const stadium = e.strVenue || "Stadion TBD";
                            const referee = e.strOfficial || "(Belum rilis dari official)";
                            
                            replyText += `*${e.strLeague}*\n`;
                            replyText += `${e.strHomeTeam} vs ${e.strAwayTeam} : ${timeWib} (${stadium}) \nReferee : ${referee}\n\n`;
                        }
                        
                        if (events.length > 15) replyText += `\n_...dan ${events.length - 15} pertandingan lainnya._`;
                        
                        await sock.sendMessage(chatJid, { text: replyText.trim() }, { quoted: msg });
                        await saveSystemLog(chatJid, `User mengecek jadwal sepakbola struktur: ${query}`);
                    }
                }
            } catch (apiErr) {
                console.error("SportsDB API Error:", apiErr.message);
            }

            // 2. Fallback: Jika Jadwal Tidak Ditemukan di Database
            if (!hasSchedule) {
                return await sock.sendMessage(chatJid, { text: `❌ Maaf Kak, jadwal resmi untuk "${query}" belum di-update oleh database server olahraga (TheSportsDB) saat ini.\n\n_(Catatan: Server gratisan yang bot gunakan terkadang lambat memasukkan jadwal turnamen besar seperti Piala Dunia atau salah membaca tanggal)_` }, { quoted: msg });
            }
            
        } catch (err) {
            console.error('Bola Error:', err.message);
            await sock.sendMessage(chatJid, { text: '❌ Gagal memproses data sepakbola.' }, { quoted: msg });
        }
    }
};
