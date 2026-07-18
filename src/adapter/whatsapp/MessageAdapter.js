/**
 * MessageAdapter
 * Bertanggung jawab menerjemahkan format mentah Baileys ke format yang dipahami ActionEngine,
 * dan sebaliknya (menerjemahkan Application Response menjadi format kirim Baileys).
 */
class MessageAdapter {
    /**
     * Mengekstrak teks dari WAMessage Baileys
     */
    extractText(message) {
        if (!message.message) return '';
        
        const type = Object.keys(message.message)[0];
        
        if (type === 'conversation') {
            return message.message.conversation;
        } else if (type === 'extendedTextMessage') {
            return message.message.extendedTextMessage.text;
        }
        
        return '';
    }

    /**
     * Mengubah nomor WhatsApp menjadi ID abstrak (Player ID).
     * Saat ini kita hapus @s.whatsapp.net, tapi ke depannya
     * bisa di-mapping ke Player ID di database.
     */
    extractSenderId(jid) {
        if (!jid) return 'unknown';
        return jid.replace(/@s\.whatsapp\.net$/, '');
    }

    /**
     * Menerjemahkan ActionResult dari ActionEngine ke parameter kirim WhatsApp.
     */
    formatResponse(actionResult) {
        // Jika ada banyak pesan, kita gabungkan menjadi satu string dengan newline
        if (actionResult.messages && actionResult.messages.length > 0) {
            return { text: actionResult.messages.join('\n\n') };
        }
        
        if (actionResult.errors && actionResult.errors.length > 0) {
            return { text: "Terjadi kesalahan sistem: " + actionResult.errors[0] };
        }

        return null;
    }
}

module.exports = MessageAdapter;
