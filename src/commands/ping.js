module.exports = {
    name: 'ping',
    aliases: ['!ping'],
    async execute(sock, msg, chatJid, messageText) {
        console.log('🎾 Received !ping command, replying with pong!');
        await sock.sendMessage(chatJid, { text: 'pong!' }, { quoted: msg });
    }
};
