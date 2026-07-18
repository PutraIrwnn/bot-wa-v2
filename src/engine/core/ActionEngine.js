const DomainEvents = require('./DomainEvents');
const NarrationContext = require('../ai/NarrationContext');

/**
 * ActionEngine
 * Berfungsi sebagai Thin Orchestration Layer.
 * Tidak ada Business Logic (IF trust > 30) di sini.
 * Murni memvalidasi command mentah, menembak EventBus/Domain, dan merangkum hasil (Application Response).
 */
class ActionEngine {
    constructor(eventBus, npcEngine, exploreEngine, narrationProvider = null) {
        this.eventBus = eventBus;
        this.npcEngine = npcEngine;
        this.exploreEngine = exploreEngine;
        this.narrationProvider = narrationProvider;
    }

    /**
     * Memproses Command Intent dari Router
     * @param {Object} commandIntent - misal { command: 'talk', args: ['rina'], player: '123' }
     * @returns {Object} Application Response { messages: [], events: [], errors: [] }
     */
    async handleAction(commandIntent) {
        const response = {
            messages: [],
            events: [],
            errors: []
        };

        try {
            switch (commandIntent.command) {
                case 'talk':
                    return await this._handleTalk(commandIntent, response);
                case 'help':
                    return await this._handleHelp(commandIntent, response);
                default:
                    response.messages.push("Perintah tidak dikenali. Ketik !help untuk bantuan.");
                    return response;
            }
        } catch (error) {
            response.errors.push(error.message);
            response.messages.push("Dunia sedang mengalami gangguan sistem.");
            return response;
        }
    }

    async _handleTalk(intent, response) {
        const targetNpc = intent.args[0];
        if (!targetNpc) {
            response.messages.push("Kamu ingin berbicara dengan siapa? (contoh: !talk rina)");
            return response;
        }

        const npc = this.npcEngine.npcs[targetNpc.toLowerCase()];
        if (!npc) {
            response.messages.push(`Tidak ada yang bernama ${targetNpc} di sini.`);
            return response;
        }

        // Action memicu perubahan RAM dan asinkron Repo (dilakukan oleh NPCEngine kelak, tapi kita trigger dari sini via event)
        // Tunggu, kalau "talk" apakah mem-publish event? Mungkin tidak, hanya read state.
        
        // Trigger narration via AI or fallback
        let replyText = `[Fallback] ${npc.name} sedang sibuk.`;
        if (this.narrationProvider) {
            const context = new NarrationContext({ intent: 'talk', npc, player: intent.player });
            replyText = await this.narrationProvider.provideNarration(context);
        } else {
            if (npc.mood === 'linglung' || npc.memory_health < 40) {
                replyText = `*${npc.name} memegang kepalanya.* "Siapa... kau? Rasanya ada kabut di ingatanku."`;
            } else if (npc.mood === 'berterima kasih') {
                replyText = `*${npc.name} tersenyum manis.* "Terima kasih banyak atas bantuanmu tadi!"`;
            } else {
                replyText = `*${npc.name} menyapamu.* "Halo! Cuaca hari ini cerah ya."`;
            }
        }

        response.messages.push(replyText);
        return response;
    }

    async _handleHelp(intent, response) {
        const targetNpc = intent.args[0];
        if (!targetNpc) {
            response.messages.push("Kamu ingin membantu siapa? (contoh: !help rina)");
            return response;
        }

        const npc = this.npcEngine.npcs[targetNpc.toLowerCase()];
        if (!npc) {
            response.messages.push(`Tidak ada yang bernama ${targetNpc} di sini.`);
            return response;
        }

        // Publish domain event
        this.eventBus.publish(DomainEvents.PlayerHelpedNpc, {
            player: intent.player,
            npc: npc.id
        });

        // Minta narasi dari AI (AI murni narasi, bukan yang memutuskan player membantunya)
        let replyText = `Kamu telah membantu ${npc.name}.`;
        if (this.narrationProvider) {
            const context = new NarrationContext({ intent: 'help', npc, player: intent.player });
            replyText = await this.narrationProvider.provideNarration(context);
        }
        
        response.messages.push(replyText);
        response.events.push(DomainEvents.PlayerHelpedNpc);
        
        return response;
    }
}

module.exports = ActionEngine;
