const { Sticker, StickerTypes } = require('wa-sticker-formatter');

/**
 * Konversi buffer gambar/video menjadi Stiker WhatsApp WebP dengan Exif.
 * @param {Buffer} buffer - Buffer media asli
 * @param {string} packName - Nama paket stiker
 * @param {string} authorName - Nama pembuat stiker
 * @returns {Promise<Buffer>} - Buffer WebP Stiker
 */
async function createWhatsAppSticker(buffer, packName = 'Bot-Wa', authorName = 'Putra Ganteng') {
    const sticker = new Sticker(buffer, {
        pack: packName, 
        author: authorName, 
        type: StickerTypes.FULL, // Menjaga rasio gambar (bisa diganti CROPPED jika ingin kotak sempurna)
        quality: 50,
        background: 'transparent'
    });
    return await sticker.toBuffer();
}

module.exports = { createWhatsAppSticker };
