const test = require('node:test');
const assert = require('node:assert/strict');
const dbPool = require('../../src/config/db');
const EventBus = require('../../src/engine/core/EventBus');
const NPCEngine = require('../../src/engine/npc/NPCEngine');
const ExploreEngine = require('../../src/engine/core/ExploreEngine');
const ActionEngine = require('../../src/engine/core/ActionEngine');
const CommandRouter = require('../../src/adapter/router/CommandRouter');
const MessageAdapter = require('../../src/adapter/whatsapp/MessageAdapter');
const MySqlNpcRepository = require('../../src/repository/MySqlNpcRepository');
const DomainEvents = require('../../src/engine/core/DomainEvents');

test('WhatsApp Flow E2E Integration (Ports & Adapters)', async (t) => {
    t.after(() => dbPool.end());

    const eventBus = new EventBus();
    const npcRepo = new MySqlNpcRepository(dbPool);
    const npcEngine = new NPCEngine(eventBus, npcRepo);
    const exploreEngine = new ExploreEngine(eventBus);
    
    // Recovery / Init
    await npcEngine.init();

    const actionEngine = new ActionEngine(eventBus, npcEngine, exploreEngine);
    const commandRouter = new CommandRouter();
    const messageAdapter = new MessageAdapter();

    await t.test('1. CommandRouter mem-parsing teks WhatsApp dengan benar', () => {
        const rawWaText = "!talk rina";
        const sender = "628123456789";
        const intent = commandRouter.parse(rawWaText, sender);
        
        assert.equal(intent.command, 'talk');
        assert.equal(intent.args[0], 'rina');
        assert.equal(intent.player, '628123456789');
    });

    await t.test('2. ActionEngine menerjemahkan intent menjadi ActionResult', async () => {
        const intent = { command: 'talk', args: ['rina'], player: 'player1' };
        
        // Memastikan Rina diubah state-nya (biar tidak linglung) untuk test text
        if (npcEngine.npcs['rina']) {
            npcEngine.npcs['rina'].mood = 'tenang';
            npcEngine.npcs['rina'].memory_health = 100;
        }

        const actionResult = await actionEngine.handleAction(intent);
        
        assert.equal(Array.isArray(actionResult.messages), true);
        assert.ok(actionResult.messages[0].includes('Halo! Cuaca hari ini cerah'));
    });

    await t.test('3. MessageAdapter memformat ActionResult menjadi format socket sendMessage Baileys', async () => {
        const actionResult = {
            messages: ["Pesan baris satu", "Pesan baris dua"],
            events: [],
            errors: []
        };

        const payload = messageAdapter.formatResponse(actionResult);
        assert.equal(payload.text, "Pesan baris satu\n\nPesan baris dua");
    });

    await t.test('4. Flow !help merubah state domain asinkron dan mengirim balasan', async () => {
        const intent = { command: 'help', args: ['rina'], player: 'player1' };
        
        // Cek trust sebelum help
        const initialTrust = npcEngine.npcs['rina'].trust;

        // Simulasi Action Engine processing
        const actionResult = await actionEngine.handleAction(intent);

        // Validasi ActionResult
        assert.ok(actionResult.messages[0].includes('Kamu telah membantu Rina'));
        assert.equal(actionResult.events[0], DomainEvents.PlayerHelpedNpc);

        // Tunggu event bus mengeksekusi asynchronous persistence di NPCEngine
        await new Promise(r => setTimeout(r, 50));

        // Validasi state berubah
        assert.ok(npcEngine.npcs['rina'].trust > initialTrust, 'Trust harus bertambah di RAM');

        // Validasi balasan yang diformat
        const payload = messageAdapter.formatResponse(actionResult);
        assert.equal(payload.text, 'Kamu telah membantu Rina.');
    });
});
