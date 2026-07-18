const dbPool = require('./config/db');
const EventBus = require('./engine/core/EventBus');
const NPCEngine = require('./engine/npc/NPCEngine');
const ExploreEngine = require('./engine/core/ExploreEngine');
const ActionEngine = require('./engine/core/ActionEngine');
const CommandRouter = require('./adapter/router/CommandRouter');
const MessageAdapter = require('./adapter/whatsapp/MessageAdapter');
const WhatsAppAdapter = require('./adapter/whatsapp/WhatsAppAdapter');
const MySqlNpcRepository = require('./repository/MySqlNpcRepository');
const GeminiAdapter = require('./adapter/llm/GeminiAdapter');
const PromptEngine = require('./engine/ai/PromptEngine');
const Logger = require('./engine/core/Logger');
const WorldEngine = require('./engine/world/WorldEngine');
const BehaviorEngine = require('./engine/npc/BehaviorEngine');
const WeatherEngine = require('./engine/world/WeatherEngine');
const SnapshotEngine = require('./engine/world/SnapshotEngine');
const ConsequenceEngine = require('./engine/world/ConsequenceEngine');
const StoryEngine = require('./engine/story/StoryEngine');
const RumorEngine = require('./engine/rumor/RumorEngine');
const BeliefEngine = require('./engine/npc/BeliefEngine');
const TrustManager = require('./engine/npc/TrustManager');
const RelationshipEngine = require('./engine/npc/RelationshipEngine');
const InMemoryWorldRepository = require('./repository/InMemoryWorldRepository');
const InMemorySnapshotRepository = require('./repository/InMemorySnapshotRepository');

// Ambil GEMINI_API_KEY dari env
require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const logger = new Logger('System');

async function bootstrap() {
    logger.info('Aetheria Boot Sequence Started...');

    // 1. Inisialisasi EventBus (Core)
    const eventBus = new EventBus();

    // 2. Inisialisasi Repositories (Persistence)
    const npcRepository = new MySqlNpcRepository(dbPool);

    // 3. Inisialisasi Domain Engines
    const npcEngine = new NPCEngine(eventBus, npcRepository);
    const exploreEngine = new ExploreEngine(eventBus); // Stub

    // 4. Recovery Routine: Load Data dari MySQL ke Engine RAM
    logger.info('Executing Recovery Routine...');
    await npcEngine.init();

    // 5. Inisialisasi Hybrid World Time & NPC Agency
    const worldRepo = new InMemoryWorldRepository();
    const worldEngine = new WorldEngine(eventBus, worldRepo);
    const behaviorEngine = new BehaviorEngine(eventBus, npcEngine);
    
    // Inisialisasi Weather & Snapshot
    const weatherEngine = new WeatherEngine(eventBus);
    const snapshotRepo = new InMemorySnapshotRepository();
    const snapshotEngine = new SnapshotEngine(eventBus, snapshotRepo, npcEngine);
    const consequenceEngine = new ConsequenceEngine(eventBus, worldRepo);
    const storyEngine = new StoryEngine(eventBus, snapshotRepo);
    const rumorEngine = new RumorEngine(eventBus);
    
    // Cognitive Layer (Sprint 10)
    const trustManager = new TrustManager(eventBus, npcRepository);
    const beliefEngine = new BeliefEngine(npcRepository, rumorEngine);
    const relationshipEngine = new RelationshipEngine(eventBus);

    // Mengaitkan evaluasi Belief setelah Rumor merambat
    eventBus.subscribe('rumor.spread', async (payload) => {
        // Tunda sebentar agar NPCEngine selesai memproses knowledge
        setTimeout(() => {
            beliefEngine.evaluateBeliefs(payload.targetNpcId);
        }, 10);
    });

    await worldEngine.init(); // Menjalankan Passive Tick (Catch Up)
    worldEngine.startSimulation(); // Menjalankan Active Tick

    // 6. Inisialisasi Narration Layer (AI)
    const llmAdapter = new GeminiAdapter(GEMINI_API_KEY);
    const promptEngine = new PromptEngine(llmAdapter);

    // 7. Inisialisasi Adapters Boundary (Action Engine)
    const actionEngine = new ActionEngine(eventBus, npcEngine, exploreEngine, promptEngine);

    // 8. Inisialisasi WhatsApp Adapters
    const commandRouter = new CommandRouter();
    const messageAdapter = new MessageAdapter();
    const waAdapter = new WhatsAppAdapter(commandRouter, actionEngine, messageAdapter);

    // 7. Connect ke WhatsApp
    logger.info('Connecting to WhatsApp socket...');
    await waAdapter.connect();
}

// Tangkap unhandled errors agar bot tidak langsung mati
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

bootstrap();
