const axios = require('axios');

/**
 * Format tanggal ke Bahasa Indonesia (misal: 11 Juli 2026)
 */
function getIndonesianDate() {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    // Gunakan timezone Jakarta agar selalu valid sesuai zona waktu user Indonesia
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Terjemahkan kode WMO ke teks kondisi cuaca
 */
function getWeatherCondition(code) {
    // Referensi WMO Weather Code: https://open-meteo.com/en/docs
    const codes = {
        0: 'Cerah Terang ☀️',
        1: 'Cerah Berawan 🌤️',
        2: 'Berawan Sebagian ⛅',
        3: 'Mendung Gelap ☁️',
        45: 'Berkabut 🌫️',
        48: 'Kabut Tebal 🌫️',
        51: 'Gerimis Ringan 🌦️',
        53: 'Gerimis Sedang 🌦️',
        55: 'Gerimis Lebat 🌧️',
        61: 'Hujan Ringan 🌧️',
        63: 'Hujan Sedang 🌧️',
        65: 'Hujan Lebat ⛈️',
        71: 'Bersalju ❄️', // Siapa tahu user ngecek Tokyo hehe
        80: 'Hujan Deras Lokal 🌧️',
        81: 'Hujan Sangat Deras ⛈️',
        82: 'Hujan Badai Terburuk ⛈️',
        95: 'Badai Petir Ringan 🌩️',
        96: 'Badai Petir & Hujan Es ⛈️',
        99: 'Badai Petir Hebat ⛈️'
    };
    return codes[code] || 'Kondisi Tidak Diketahui ❓';
}

/**
 * Ambil data cuaca dari Open-Meteo API
 */
async function getWeather(city) {
    try {
        // 1. Cari titik koordinat (Geocoding)
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=id&format=json`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            throw new Error(`Kota "${city}" tidak ditemukan di peta. Coba nama kota yang lebih spesifik/umum.`);
        }
        
        const location = geoResponse.data.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const locationName = location.name;

        // 2. Ambil data cuaca (Weather Forecast)
        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=uv_index_max&timezone=Asia/Jakarta`);
        
        const current = weatherResponse.data.current_weather;
        // Ambil UV index hari ini (indeks 0 dari array daily)
        const uvIndex = weatherResponse.data.daily.uv_index_max[0];
        
        const temp = current.temperature;
        const condition = getWeatherCondition(current.weathercode);
        const dateStr = getIndonesianDate();
        
        // 3. Meracik Tips Cerdas
        let tips = [];
        
        // Tips berdasarkan UV
        if (uvIndex > 7) {
            tips.push(`Sinar UV sangat ekstrem (${uvIndex})! Wajib pakai sunscreen kalau keluar rumah biar kulit gak rusak ya bos.`);
        } else if (uvIndex > 5) {
            tips.push(`Nilai UV Index Tinggi (${uvIndex}). Gunakan sunscreen jika keluar rumah!`);
        }
        
        // Tips berdasarkan Hujan (WMO codes for rain/drizzle/thunderstorm are generally > 50)
        if (current.weathercode >= 51 && current.weathercode <= 99) {
            tips.push(`Diperkirakan akan terjadi hujan/gerimis! Bawa payung atau jas hujan ya kalau mau bepergian.`);
        } else if (temp > 34) {
            tips.push(`Suhu sangat panas (${temp}°C)! Perbanyak minum air putih biar gak dehidrasi.`);
        }
        
        // Jika cuaca sedang ideal dan tidak ada tips bahaya
        if (tips.length === 0) {
            tips.push(`Cuaca sedang ideal dan bersahabat. Selamat beraktivitas!`);
        }

        const tipsText = tips.map(t => `💡 ${t}`).join('\n');

        return `🌤️ *CUACA ${locationName.toUpperCase()}* 🌤️\nTanggal: ${dateStr}\n\nKondisi: ${condition}\nSuhu: ${temp}°C\nUV Index: ${uvIndex || 0}\n\n*Tips Bot-Wa:*\n${tipsText}`;

    } catch (error) {
        console.error('Weather API Error:', error.message);
        throw new Error(error.message.includes('tidak ditemukan') ? error.message : 'Gagal mengambil data cuaca saat ini. Coba beberapa saat lagi.');
    }
}

module.exports = { getWeather };
