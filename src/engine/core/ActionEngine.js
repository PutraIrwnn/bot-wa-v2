const DomainEvents = require('./DomainEvents');
const NarrationContext = require('../ai/NarrationContext');
const NewsPromptBuilder = require('../ai/NewsPromptBuilder');

/**
 * ActionEngine
 * Berfungsi sebagai Thin Orchestration Layer.
 * Tidak ada Business Logic (IF trust > 30) di sini.
 * Murni memvalidasi command mentah, menembak EventBus/Domain, dan merangkum hasil (Application Response).
 */
class ActionEngine {
    constructor(eventBus, npcEngine, exploreEngine, narrationProvider = null, factionEngine = null, rumorEngine = null) {
        this.eventBus = eventBus;
        this.npcEngine = npcEngine;
        this.exploreEngine = exploreEngine;
        this.narrationProvider = narrationProvider;
        this.factionEngine = factionEngine; // Digunakan untuk cek faksi
        this.rumorEngine = rumorEngine;
        this.newsEngine = null; // Di-set dari luar bila ada
        this.newsCache = {}; // Untuk menyimpan hasil AI narasi koran per editionId
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
                case 'reputasi':
                case 'status':
                    return await this._handleReputation(commandIntent, response);
                case 'faksi':
                    return await this._handleFaction(commandIntent, response);
                case 'rumor':
                case 'gosip':
                    return await this._handleRumor(commandIntent, response);
                case 'berita':
                case 'news':
                    return await this._handleNews(commandIntent, response);
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

    async _handleReputation(intent, response) {
        const targetNpc = intent.args[0];
        if (!targetNpc) {
            response.messages.push("Cek reputasi dengan siapa? (contoh: !reputasi rina)");
            return response;
        }

        const npc = this.npcEngine.npcs[targetNpc.toLowerCase()];
        if (!npc) {
            response.messages.push(`Tidak ada yang bernama ${targetNpc} di sini.`);
            return response;
        }

        // Trust terhadap player (menggunakan trustNetwork)
        const trustScore = npc.trustNetwork[intent.player] || 50; // default 50
        let status = 'Netral';
        if (trustScore > 80) status = 'Sangat Percaya';
        else if (trustScore > 60) status = 'Percaya';
        else if (trustScore < 15) status = 'Bermusuhan';
        else if (trustScore < 30) status = 'Curiga';

        response.messages.push(`Reputasi kamu di mata ${npc.name} adalah: ${status} (Skor Trust: ${trustScore}).`);
        return response;
    }

    async _handleFaction(intent, response) {
        if (!this.factionEngine) {
            response.messages.push("Sistem faksi saat ini tidak aktif.");
            return response;
        }

        const targetFaction = intent.args[0];
        
        if (targetFaction) {
            const relKey = this.factionEngine._getRelKey(intent.player, targetFaction.toUpperCase());
            const rel = this.factionEngine.playerRelations[relKey];
            const faction = this.factionEngine.factions[targetFaction.toUpperCase()];
            
            if (!faction) {
                response.messages.push(`Faksi ${targetFaction} tidak diketahui.`);
                return response;
            }

            if (!rel) {
                response.messages.push(`Kamu belum memiliki interaksi berarti dengan faksi ${faction.name}. (Status: Netral)`);
                return response;
            }

            response.messages.push(`Relasimu dengan faksi ${faction.name}: ${rel.trustLevel} (Skor: ${rel.trust})`);
        } else {
            // Tampilkan semua relasi faksi player
            const playerRels = Object.values(this.factionEngine.playerRelations)
                .filter(r => r.playerId === intent.player);
            
            if (playerRels.length === 0) {
                response.messages.push("Kamu belum berafiliasi atau dikenal oleh faksi mana pun.");
                return response;
            }

            let reply = "Daftar relasi faksimu:\n";
            playerRels.forEach(r => {
                const fName = this.factionEngine.factions[r.factionId]?.name || r.factionId;
                reply += `- ${fName}: ${r.trustLevel} (${r.trust})\n`;
            });
            response.messages.push(reply);
        }

        return response;
    }

    async _handleRumor(intent, response) {
        if (!this.rumorEngine) {
            response.messages.push("Jalanan sangat sepi, tidak ada rumor yang terdengar.");
            return response;
        }

        const activeRumors = Array.from(this.rumorEngine.globalRumors.values());
        
        if (activeRumors.length === 0) {
            response.messages.push("Jalanan sepi. Tidak ada gosip baru yang sedang hangat dibicarakan.");
            return response;
        }

        // Deterministic Pseudo-Random Shuffle based on World State
        const crypto = require('crypto');
        const rumorStateHash = activeRumors.map(r => r.id).sort().join('_');
        let seed = parseInt(crypto.createHash('md5').update(`${intent.player}_${rumorStateHash}`).digest('hex').substring(0,8), 16);
        
        const shuffled = [...activeRumors];
        for (let i = shuffled.length - 1; i > 0; i--) {
            seed = (seed * 9301 + 49297) % 233280;
            const rnd = seed / 233280;
            const j = Math.floor(rnd * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selectedRumors = shuffled.slice(0, 3);

        let reply = "Kamu menguping pembicaraan di jalanan:\n";
        selectedRumors.forEach(r => {
            const text = r.rawText || `Ada kabar tentang ${r.originEvent} di ${r.originLocation}.`;
            reply += `- "${text}" (Kredibilitas: ${r.credibility}%)\n`;
        });

        response.messages.push(reply);
        return response;
    }

    async _handleNews(intent, response) {
        if (!this.newsEngine) {
            response.messages.push("Kantor berita Aetheria Chronicle sedang tutup. Tidak ada berita hari ini.");
            return response;
        }

        const edition = this.newsEngine.latestEdition;
        if (!edition) {
            response.messages.push("Belum ada edisi berita yang diterbitkan hari ini.");
            return response;
        }

        // Lazy AI Generation & Caching
        if (this.newsCache[edition.id]) {
            response.messages.push(this.newsCache[edition.id]);
            return response;
        }

        let replyText = "";

        if (this.narrationProvider && this.narrationProvider.model) {
            try {
                // Gunakan NewsPromptBuilder untuk membentuk prompt
                const prompt = NewsPromptBuilder.build(edition);
                
                // Minta LLM mem-generate konten berita (karena INarrationProvider belum tentu support generic prompt, 
                // kita asumsikan narrationProvider.model.generateContent bisa dipanggil langsung, 
                // atau kita panggil lewat method yang ada. Di Aetheria, biasanya kita butuh PromptEngine.
                // Mari asumsikan NarrationProvider menyediakan metode raw atau kita gunakan method standar).
                
                // Jika kita hanya punya narrationProvider.provideNarration, kita bisa mengadaptasinya
                // Tetapi ActionEngine hanya memanggil provideNarration(context).
                // Kita akan buat context khusus 'news' jika NarrationProvider mendukungnya.
                // Untuk amannya, kita panggil LLM langsung jika expose .model, atau fallback.
                if (typeof this.narrationProvider.generateRaw === 'function') {
                    replyText = await this.narrationProvider.generateRaw(prompt);
                } else if (this.narrationProvider.model) {
                    const result = await this.narrationProvider.model.generateContent(prompt);
                    replyText = result.response.text();
                } else {
                    throw new Error("No raw AI generator available");
                }
                
                // Bersihkan cache lama dan simpan yang baru
                this.newsCache = {};
                this.newsCache[edition.id] = replyText;
            } catch (err) {
                // Fallback mekanikal
                replyText = `📰 *Aetheria Chronicle - Hari ke-${edition.day}*\n\n`;
                if (edition.rumors.length === 0) {
                    replyText += "Dunia damai, tidak ada kejadian penting yang tercatat.";
                } else {
                    edition.rumors.forEach((r, i) => {
                        replyText += `${i+1}. ${r.rawText} (Tingkat Kepastian: ${r.credibility}%)\n`;
                    });
                }
            }
        } else {
            // Fallback mekanikal tanpa AI
            replyText = `📰 *Aetheria Chronicle - Hari ke-${edition.day}*\n\n`;
            if (edition.rumors.length === 0) {
                replyText += "Dunia damai, tidak ada kejadian penting yang tercatat.";
            } else {
                edition.rumors.forEach((r, i) => {
                    replyText += `${i+1}. ${r.rawText} (Tingkat Kepastian: ${r.credibility}%)\n`;
                });
            }
        }

        response.messages.push(replyText);
        return response;
    }
}

module.exports = ActionEngine;
