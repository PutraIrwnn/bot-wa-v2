const axios = require('axios');

/**
 * Generate AI image using Pollinations AI
 * @param {string} prompt - Deskripsi gambar
 * @returns {Promise<Buffer>} - Buffer gambar JPEG
 */
async function generateImage(prompt) {
    try {
        // Encode spasi dan karakter khusus agar valid di URL
        const encodedPrompt = encodeURIComponent(prompt);
        // Lebar 1024x1024 px (Kualitas HD Persegi)
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

        // Request gambar ke server dan kembalikan sebagai arraybuffer
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Image Generation Error:', error.message);
        throw new Error('Gagal melukis gambar. Server mungkin sedang sibuk, coba lagi nanti.');
    }
}

module.exports = { generateImage };
