const axios = require('axios');
const youtubedl = require('youtube-dl-exec');

/**
 * Download TikTok video using tikwm API
 */
async function downloadTikTok(url) {
    try {
        const response = await axios.post('https://www.tikwm.com/api/', { url: url, count: 12, cursor: 0, web: 1, hd: 1 });
        if (response.data && response.data.code === 0) {
            const data = response.data.data;
            // Terkadang API mengembalikan path relatif seperti '/video/media/...', jadi kita harus tambahkan domain utamanya
            const finalVideoUrl = data.play.startsWith('http') ? data.play : 'https://www.tikwm.com' + data.play;
            const finalAudioUrl = data.music.startsWith('http') ? data.music : 'https://www.tikwm.com' + data.music;
            
            return {
                title: data.title,
                videoUrl: finalVideoUrl,
                audioUrl: finalAudioUrl
            };
        } else {
            throw new Error('Gagal mendapatkan data dari server TikTok.');
        }
    } catch (error) {
        console.error('TikTok API Error:', error);
        throw new Error('Gagal memproses link TikTok. Pastikan link valid dan tidak ter-private.');
    }
}

/**
 * Download YouTube Audio (MP3)
 */
async function downloadYouTubeAudio(url) {
    try {
        const output = await youtubedl(url, {
            dumpJson: true,
            noCheckCertificates: true,
            noWarnings: true
        });
        
        const title = output.title;
        const audioFormat = output.formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none').sort((a,b) => b.abr - a.abr)[0];
        
        if (!audioFormat) throw new Error('Tidak menemukan format audio.');
        
        return {
            title,
            streamUrl: audioFormat.url
        };
    } catch (error) {
        console.error('YouTube Audio Error:', error.message);
        throw new Error('Gagal mengunduh audio YouTube.');
    }
}

/**
 * Download YouTube Video (MP4)
 */
async function downloadYouTubeVideo(url) {
    try {
        const output = await youtubedl(url, {
            dumpJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            format: 'best[ext=mp4]'
        });
        
        const title = output.title;
        
        if (!output.url) throw new Error('Tidak menemukan format video.');
        
        return {
            title,
            streamUrl: output.url
        };
    } catch (error) {
        console.error('YouTube Video Error:', error.message);
        throw new Error('Gagal mengunduh video YouTube. Mungkin ukurannya terlalu besar.');
    }
}

module.exports = { downloadTikTok, downloadYouTubeAudio, downloadYouTubeVideo };
