/**
 * CommandRouter
 * Mengambil teks dari pengguna dan memecahnya menjadi Command Intent.
 */
class CommandRouter {
    /**
     * Mem-parsing teks pesan menjadi Intent Object
     * @param {string} text - Pesan mentah, misal: "!talk rina"
     * @param {string} playerIdentifier - ID abstrak player
     * @returns {Object|null} Intent object atau null jika bukan command
     */
    parse(text, playerIdentifier) {
        if (!text || !text.startsWith('!')) {
            return null;
        }

        const args = text.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        return {
            command: command,
            args: args,
            player: playerIdentifier
        };
    }
}

module.exports = CommandRouter;
