# 🌍 AETHERIA — Project Context Document
> **Dokumen ini adalah satu-satunya sumber kebenaran (Single Source of Truth) untuk melanjutkan pengembangan di chat room baru.**
> **Terakhir diperbarui: 17 Juli 2026 — Setelah Sprint 10 selesai (Phase 1 Complete).**

---

## 📍 Informasi Proyek

| Key | Value |
|---|---|
| **Nama Proyek** | Aetheria — Living World WhatsApp RPG Bot |
| **Lokasi** | `c:\laragon\www\bot-wa-v2` |
| **Runtime** | Node.js (CommonJS) |
| **Database** | MySQL (via `mysql2`) |
| **WhatsApp Library** | `@whiskeysockets/baileys` |
| **AI Provider** | Google Gemini (`@google/genai`) |
| **Entry Point** | `index.js` (root) → memanggil `src/index.js` (bootstrap) |

---

## 🏛️ Filosofi Inti (Wajib Dibaca Pertama)

Proyek ini BUKAN bot WhatsApp biasa. Aetheria adalah **Living World Simulation** di mana:

1. **Story First** — Cerita lahir dari simulasi dunia, bukan ditulis manual.
2. **AI Never Decides (ADR-0009)** — AI hanyalah narator. AI tidak menentukan trust, memori, cuaca, atau nasib NPC.
3. **Deterministic State** — Semua state dunia harus bisa direproduksi. Tidak ada `Math.random()` di simulasi inti (cuaca menggunakan seed deterministik).
4. **Event-Driven Architecture (ADR-0001)** — Semua engine berkomunikasi melalui EventBus. Tidak ada coupling langsung.
5. **Hexagonal Architecture (ADR-0008)** — Transport (WhatsApp/Baileys) tidak pernah masuk domain. Domain tidak tahu JID, socket, atau message ID.
6. **Knowledge Ownership (ADR-0017)** — Setiap engine hanya boleh mengubah data miliknya sendiri, melalui event.

---

## 📊 Sprint History & Status

### Phase 1: Core Framework (Sprint 1–5) ✅ SELESAI
| Sprint | Fokus | Status | ADR |
|:---:|---|:---:|---|
| 1 | Event-Driven Core (EventBus) | ✅ | ADR-0001 |
| 2 | Reliability & Contracts | ✅ | ADR-0002 |
| 3 | Persistence Layer | ✅ | ADR-0003, 0004 |
| 4 | Hexagonal Architecture | ✅ | ADR-0005, 0006, 0007, 0008 |
| 5 | AI Narration Layer | ✅ | ADR-0009 |

### Phase 2: Living World Expansion (Sprint 6–10) ✅ SELESAI
| Sprint | Fokus | Status | ADR |
|:---:|---|:---:|---|
| 6 | NPC Agency + Hybrid World Time | ✅ | ADR-0010, 0011 |
| 7 | World State Evolution (Weather, Snapshot) | ✅ | ADR-0012, 0013 |
| 8 | Causality Engine (Story Engine) | ✅ | ADR-0014, 0015 |
| 9 | Rumor Evolution & Knowledge Lifecycle | ✅ | ADR-0016, 0017 |
| 10 | Belief & Trust System | ✅ | ADR-0018, 0019 |

### Phase 3: (BELUM DIMULAI)
> Roadmap saran Tech Lead:
> - Sprint 11 → Relationship Dynamics (Trust → Relationship → Faction)
> - Sprint 12+ → Social Dynamics, Observability, dll.

---

## 🗂️ Arsitektur Decision Records (ADR) — Lengkap

| ADR | Topik | Ringkasan |
|:---:|---|---|
| 0001 | EventBus Pattern | Semua engine berkomunikasi melalui event. Tidak ada coupling langsung. |
| 0002 | Fire-and-Forget | Event diproses async. `publish()` tidak menunggu listener selesai. |
| 0003 | Error Policy | Operational Error → Logger. Domain Error → Event. |
| 0004 | Repository Pattern | Interface pemisahan mutlak terhadap logika penyimpanan. |
| 0005 | Recovery Scalability | Load All saat ini. Lazy Loading jika > 500 entitas. |
| 0006 | Repository Contract | Semua fungsi wajib return Rich Result Object, bukan boolean. |
| 0007 | Unit of Work Policy | `IUnitOfWork` dilarang untuk query tunggal. |
| 0008 | Ports & Adapters | Transport (WhatsApp) berhenti di adapter. Domain bersih. |
| 0009 | AI Boundary | AI = narator. Tidak boleh ubah trust, memory, game state. |
| 0010 | Future AI Cache | Wacana cache narasi deterministic (belum diimplementasi). |
| 0011 | Hybrid World Time | Waktu = domain concept. Passive Tick (catch-up) + Active Tick (interval). |
| 0012 | Single Source of Time | Hanya `WorldEngine` yang boleh publish `world.tick`. |
| 0013 | Utility AI (Scoring) | Behavior NPC didikte matematika, bukan ML/LLM. |
| 0014 | Story is Derived | Story Engine mengamati, bukan menulis cerita. |
| 0015 | Derived Facts vs World State | Story Event ≠ World State. ConsequenceEngine yang memutuskan dampak permanen. |
| 0016 | Knowledge Lifecycle | Story Event → Rumor → Spread → Memory → Decay → Forgotten. |
| 0017 | Knowledge Ownership | Setiap engine hanya ubah data miliknya sendiri. Melalui event. |
| 0018 | Memory ≠ Belief | Tahu ≠ Percaya. Belief dievaluasi oleh Rule Engine. |
| 0019 | Trust Requires Evidence | Trust hanya berubah berdasarkan verified outcome dari dunia. |

File ADR lengkap ada di: `docs/adr/` (INDEX.md + 0000–0019).

---

## 🔌 Arsitektur & Event Flow

### Boot Sequence (src/index.js)
```
EventBus (Core)
    ↓
MySqlNpcRepository (Persistence)
    ↓
NPCEngine (Domain) ← npcRepository
    ↓ 
WorldEngine (Hybrid Time) ← worldRepository
BehaviorEngine (NPC Agency) ← npcEngine
WeatherEngine (Deterministic Weather)
SnapshotEngine (Dual-Level Snapshot)
ConsequenceEngine (Story → World State)
StoryEngine (Causality Observer)
RumorEngine (Social Knowledge)
TrustManager (Evidence-Based Trust)
BeliefEngine (Cognitive Evaluation)
    ↓
GeminiAdapter → PromptEngine (AI Narration)
    ↓
ActionEngine (Application Response)
CommandRouter → MessageAdapter → WhatsAppAdapter (Transport)
```

### Event Pipeline Utama
```
world.tick (WorldEngine)
    ↓
WeatherEngine → world.stateEvolution (SimulationContext)
    ↓
├─ SnapshotEngine (Upsert Current / Insert History jika significant)
├─ BehaviorEngine → npc.decidedToMove → NPCEngine → npc.moved
└─ StoryEngine (Evaluasi Rules) → story.marketBusy / story.harvestFailed
    ↓
├─ RumorEngine → Rumor Created (Heat, Credibility)
├─ ConsequenceEngine → World State Update (food_supply = LOW)
└─ npc.metOtherNpc → rumor.barterRequest → rumor.spread
    ↓
├─ NPCEngine → NPCKnowledge (heardFrom, transmissionCount)
├─ BeliefEngine → NPCBelief (beliefScore, certainty)
└─ world.predictionCorrect/Wrong → TrustManager → trustNetwork update
```

---

## 📁 Struktur Direktori Lengkap

```
bot-wa-v2/
├── index.js                          # Entry point (memanggil src/index.js)
├── init.sql                          # Schema: users, groups_config, game_scores
├── init_world.sql                    # Schema: players, inventory, quests, npc_profiles, world_state
├── migrate.js                        # Migration script
├── package.json                      # Dependencies
│
├── docs/
│   ├── BOOT_SEQUENCE.md
│   └── adr/
│       ├── INDEX.md                  # Master index ADR
│       ├── 0000-project-philosophy.md
│       ├── 0001 ... 0019             # 19 ADR files
│
├── src/
│   ├── index.js                      # Bootstrap (wiring semua engine)
│   │
│   ├── adapter/
│   │   ├── llm/
│   │   │   ├── ILLMAdapter.js        # Interface (Port)
│   │   │   └── GeminiAdapter.js      # Implementasi Gemini
│   │   ├── router/
│   │   │   └── CommandRouter.js      # Routing command user
│   │   └── whatsapp/
│   │       ├── MessageAdapter.js     # Transform domain → WA format
│   │       └── WhatsAppAdapter.js    # Baileys socket handler
│   │
│   ├── engine/
│   │   ├── core/
│   │   │   ├── EventBus.js           # Pub/Sub dengan contract guarantee
│   │   │   ├── DomainEvents.js       # Registry semua event name
│   │   │   ├── ActionEngine.js       # Menerima command → return ApplicationResponse
│   │   │   ├── ExploreEngine.js      # Stub untuk eksplorasi lokasi
│   │   │   ├── Logger.js             # Simple logging utility
│   │   │   ├── RumorEngine.js        # (Legacy, digantikan oleh engine/rumor/)
│   │   │   └── StoryEngine.js        # (Legacy, digantikan oleh engine/story/)
│   │   │
│   │   ├── npc/
│   │   │   ├── NPCEngine.js          # Pemilik data NPC (state, movement, knowledge, memory)
│   │   │   ├── BehaviorEngine.js     # Pure evaluator (probabilitas/jadwal → npc.decidedToMove)
│   │   │   ├── BeliefEngine.js       # Evaluasi Knowledge + Trust → NPCBelief
│   │   │   ├── NPCBelief.js          # DTO: { rumorId, beliefScore, certainty, reason }
│   │   │   └── TrustManager.js       # Evidence-based trust fluctuation
│   │   │
│   │   ├── world/
│   │   │   ├── WorldEngine.js        # Single Source of Time. Hybrid Tick.
│   │   │   ├── WeatherEngine.js      # Deterministic weather + state machine transition
│   │   │   ├── SimulationContext.js   # DTO: { day, season, weather, hour }
│   │   │   ├── SnapshotEngine.js     # Dual-Level: Current (upsert) + History (significant only)
│   │   │   ├── WorldSnapshotDTO.js   # DTO untuk snapshot data
│   │   │   └── ConsequenceEngine.js  # Story Event → World State permanen
│   │   │
│   │   ├── story/
│   │   │   ├── StoryEngine.js        # Causality Observer (subscribe events → evaluate rules → publish story)
│   │   │   ├── StoryContext.js        # DTO: { currentSnapshot, recentDomainEvents }
│   │   │   └── StoryRules/
│   │   │       ├── MarketRules.js    # Evidence aggregation (population + noise → marketBusy)
│   │   │       └── HarvestRules.js   # Weather condition → harvestFailed
│   │   │
│   │   ├── rumor/
│   │   │   ├── RumorEngine.js        # Lifecycle: Created → Spread → Decay → Forgotten
│   │   │   └── RumorDTO.js           # { id, heat, credibility, originEvent, originLocation, createdDay }
│   │   │
│   │   └── ai/
│   │       ├── INarrationProvider.js  # Interface
│   │       ├── PromptEngine.js        # Orchestrator narasi AI
│   │       ├── NPCPromptBuilder.js    # Builder prompt NPC
│   │       ├── NarrationContext.js    # DTO untuk konteks narasi
│   │       └── NarrationSanitizer.js  # Pembersih output AI
│   │
│   ├── repository/
│   │   ├── INpcRepository.js           # Interface
│   │   ├── IWorldRepository.js         # Interface
│   │   ├── IUnitOfWork.js              # Interface
│   │   ├── MySqlNpcRepository.js       # Implementasi MySQL
│   │   ├── MySqlWorldRepository.js     # Implementasi MySQL
│   │   ├── MySqlUnitOfWork.js          # Implementasi MySQL
│   │   ├── InMemoryWorldRepository.js  # Implementasi In-Memory
│   │   └── InMemorySnapshotRepository.js # Implementasi In-Memory
│   │
│   ├── commands/                     # 18 command files (ai, menu, ping, sticker, dll.)
│   ├── prompts/npc/rina.md           # Template prompt NPC Rina
│   ├── handlers/                     # Message handlers
│   ├── plugins/                      # Plugin utilities (sticker, imageGenerator, downloader)
│   ├── connection/                   # WhatsApp connection management
│   ├── config/                       # DB config, dll.
│   ├── data/                         # Static data files
│   └── utils/                        # Utility helpers
│
└── tests/
    ├── unit/
    │   ├── EventBus.test.js
    │   └── Persistence.test.js
    ├── integration/
    │   ├── AIDeterminism.test.js
    │   ├── AIFallback.test.js
    │   ├── BeliefCognition.test.js        # Sprint 10
    │   ├── DeterministicWeather.test.js   # Sprint 7
    │   ├── EvidenceBasedTrust.test.js     # Sprint 10
    │   ├── HybridWorldTime.test.js        # Sprint 6
    │   ├── KnowledgeOwnership.test.js     # Sprint 9
    │   ├── NPCAgency.test.js              # Sprint 6
    │   ├── RumorPropagation.test.js        # Sprint 9
    │   ├── StoryEngineCausality.test.js    # Sprint 8
    │   ├── WeatherTransition.test.js       # Sprint 7–8
    │   ├── WhatsAppFlow.test.js            # Sprint 4
    │   └── WorldSnapshot.test.js           # Sprint 7
    └── benchmark/
```

---

## 🧠 Domain Events Registry (DomainEvents.js)

```javascript
// Player Events
PlayerArrived: 'player.arrived'
PlayerLeft: 'player.left'
PlayerHelpedNpc: 'player.helped.npc'

// NPC Agency Events
NpcDecidedToMove: 'npc.decidedToMove'
NpcMoved: 'npc.moved'

// World Events
WorldTick: 'world.tick'

// Conversation Events
ConversationStarted: 'conversation.started'
ConversationEnded: 'conversation.ended'

// Memory & Story Events
MemoryRecovered: 'memory.recovered'
MemoryLost: 'memory.lost'
SecretDiscovered: 'secret.discovered'
StoryNodeUnlocked: 'story.nodeUnlocked'

// Rumor & News Events
RumorCreated: 'rumor.created'
RumorExpired: 'rumor.expired'
NewsPublished: 'news.published'

// World & Location Events
DayPassed: 'world.dayPassed'
LocationClosed: 'location.closed'
LocationOpened: 'location.opened'
```

### Event Tambahan (Tidak di registry, digunakan langsung via string):
```
'world.stateEvolution'       # WeatherEngine → semua subscriber
'story.marketBusy'           # StoryEngine
'story.harvestFailed'        # StoryEngine
'rumor.spread'               # RumorEngine → NPCEngine
'rumor.barterRequest'        # RumorEngine → NPCEngine
'rumor.decayed'              # RumorEngine → NPCEngine
'world.consequenceApplied'   # ConsequenceEngine
'world.predictionCorrect'    # WorldEngine/Consequence → TrustManager
'world.predictionWrong'      # WorldEngine/Consequence → TrustManager
'npc.metOtherNpc'            # Domain interaction → RumorEngine
```

---

## 🗄️ Database Schema

### Tabel Utama (init.sql)
- `users` — Profil user WhatsApp
- `groups_config` — Konfigurasi grup
- `game_scores` — Skor mini-game

### Tabel Dunia (init_world.sql)
- `players` — Profil karakter RPG
- `player_inventory` — Inventory item
- `player_achievements` — Achievement
- `npc_relationships` — Relasi player-NPC
- `npc_memory` — Memori NPC tentang player
- `quests` — Quest system
- `world_state` — Key-value store (season, day_count, world_mood)
- `npc_profiles` — Profil NPC (trust, fear, memory_health, mood, activity)

---

## ⚠️ Known Issues & Bug di index.js

Di `src/index.js` baris 62, ada typo:
```javascript
// BUG: `npcRepo` seharusnya `npcRepository`
const trustManager = new TrustManager(eventBus, npcRepo);       // ← npcRepo undefined
const beliefEngine = new BeliefEngine(npcRepo, rumorEngine);    // ← npcRepo undefined
```
**Fix:** Ganti `npcRepo` menjadi `npcRepository`.

---

## 🏗️ Prinsip Tech Lead (Wajib Dipatuhi)

Prinsip-prinsip ini ditetapkan oleh Tech Lead/Principal Engineer selama 10 sprint:

1. **"Stories are discovered from the world's evolution, not invented by the engine."** — Sprint 8
2. **"Knowledge is not truth; it is truth filtered through memory, distance, and time."** — Sprint 9
3. **"Knowledge travels through relationships, not through the air."** — Sprint 9
4. **"People do not act on what is true; they act on what they believe to be true."** — Sprint 10
5. **"Trust is earned by verified outcomes, not by persuasive words."** — Sprint 10

### Arahan Roadmap Masa Depan (dari Tech Lead):
- Rumor Variant (mutasi gosip setelah melewati N kepala) — belum diimplementasi.
- Relationship Dynamics: Trust → Relationship → Faction (jangan loncat langsung ke Faction).
- Evidence Aggregation pada StoryRules perlu diperkaya (Population + Noise + Trading Score).
- Engine baru hanya boleh dibuat jika ada konsep domain baru yang punya siklus hidup sendiri.
- `BehaviorEngine` masih menggunakan `Math.random()` — ini melanggar prinsip deterministik dan perlu diganti seed-based.

---

## 🧪 Cara Menjalankan Tests

```bash
# Semua test individual
node --test tests/unit/EventBus.test.js
node --test tests/unit/Persistence.test.js
node --test tests/integration/BeliefCognition.test.js
node --test tests/integration/EvidenceBasedTrust.test.js
node --test tests/integration/RumorPropagation.test.js
node --test tests/integration/KnowledgeOwnership.test.js
node --test tests/integration/StoryEngineCausality.test.js
node --test tests/integration/WeatherTransition.test.js
node --test tests/integration/DeterministicWeather.test.js
```

---

## 📦 Dependencies Utama

| Package | Fungsi |
|---|---|
| `@whiskeysockets/baileys` | WhatsApp Web API |
| `@google/genai` | Gemini AI untuk narasi |
| `mysql2` | Database MySQL |
| `dotenv` | Environment variables |
| `pino` | Logging |
| `wa-sticker-formatter` | Pembuatan sticker |
| `axios` / `cheerio` | HTTP requests & scraping |

---

## 🎯 Status Terakhir (Sebelum Phase 3)

**Semua yang sudah berjalan:**
- ✅ EventBus dengan contract guarantee (subscribe, publish, once, dispose)
- ✅ Hexagonal Architecture (WhatsApp → Adapter → Domain → ApplicationResponse → Adapter → WhatsApp)
- ✅ AI Narration Layer (PromptEngine → ILLMAdapter → GeminiAdapter) dengan boundary ketat
- ✅ Hybrid World Time (Passive Tick catch-up + Active Tick interval)
- ✅ Deterministic Weather (seed-based, state machine transition: Sunny → Cloudy → Rain → Storm)
- ✅ Dual-Level Snapshot (Current upsert setiap tick, History insert hanya saat significant change)
- ✅ Causality Engine (StoryEngine observe → StoryRules evaluate → Story Event publish)
- ✅ Consequence Engine (Story Event → World State permanen)
- ✅ Rumor Engine (Heat, Credibility, Decay lifecycle)
- ✅ Deterministic Contact Graph (rumor menyebar via `npc.metOtherNpc`, bukan broadcast)
- ✅ Source Tracking (heardFrom, origin, transmissionCount di NPCKnowledge)
- ✅ BeliefEngine (Knowledge + Trust → BeliefScore + Certainty)
- ✅ TrustManager (Evidence-based: trust berubah hanya dari verified world outcomes)
- ✅ 19 ADR terpublish dan terindeks

**Yang BELUM diimplementasi (Backlog):**
- ❌ Rumor Variant / Mutation
- ❌ Relationship Dynamics
- ❌ Faction System
- ❌ NewsEngine (mengubah Story Event menjadi berita tertulis)
- ❌ AI Cache (ADR-0010, masih Proposed)
- ❌ Observability Dashboard
- ❌ BehaviorEngine masih pakai `Math.random()` (harus diubah ke seed-based)
- ❌ Constraint: Consequence Engine belum menembakkan `world.predictionCorrect/Wrong` secara otomatis (masih manual via test)
