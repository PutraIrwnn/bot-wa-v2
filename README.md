# 🤖 Bot-WA — WhatsApp Bot with AI & Interactive Games

A feature-rich WhatsApp Bot built with **Node.js**, powered by **Google Gemini AI**, with real-time interactive games, media downloaders, and intelligent engineering systems.

## ✨ Features

### 🧠 AI & Search
| Command | Description |
|---------|-------------|
| `!ai [prompt]` | Conversational AI with chat memory (powered by Gemini) |
| `!imagine [prompt]` | AI Image Generation via Pollinations |
| `!google [query]` | Google Search with summarized results |
| `!wiki [topic]` | Wikipedia search |

### 📰 Information & Tools
| Command | Description |
|---------|-------------|
| `!berita` | Latest Indonesian news from CNN |
| `!cuaca [city]` | Real-time weather + UV Index |
| `!hargaemas` | Today's gold price (Antam) |
| `!kurs [currency]` | Live currency exchange rates |
| `!jadwalbola` | Football schedule & results (multi-timezone) |

### 📥 Media
| Command | Description |
|---------|-------------|
| `!download [url]` | Download TikTok & YouTube videos |
| `!sticker` | Create sticker from image |

### 🎮 Interactive Games
| Command | Description |
|---------|-------------|
| `!tebakgambar` | AI-generated picture guessing game with timer, hints, and scoring |
| `!xox` | Tic-Tac-Toe vs Bot AI or vs Player (PvP) |
| `!leaderboard` | Top 10 players by total score |
| `!profile` | Personal game statistics |

## 🏗️ Architecture

```
bot-whatsapp/
├── index.js                    # Entry point + Baileys socket
├── src/
│   ├── commands/               # Modular command files (auto-loaded)
│   ├── engine/
│   │   ├── sessionManager.js   # In-memory state engine with TTL & GC
│   │   ├── rateLimiter.js      # Sliding-window rate limiter middleware
│   │   └── gameAnswerHandler.js # Real-time game input interceptor
│   ├── handlers/
│   │   └── messageHandler.js   # Dynamic command router
│   ├── plugins/                # External API integrations
│   ├── config/                 # Database & environment config
│   ├── data/                   # Static data (quiz questions)
│   └── utils/                  # Helpers (logger, tictactoe AI)
```

### Engineering Highlights
- **Session State Engine** — In-memory state management with TTL auto-expiry and garbage collection
- **Rate Limiter** — Per-command sliding window rate limiting to prevent spam
- **Multi-Model AI Fallback** — Automatic failover across 5 Gemini models with exponential backoff retry
- **Batch Question Cache** — 1 API call generates 5 game questions, cached in memory (5x efficiency)
- **Event-Driven Architecture** — Non-blocking message processing with game state machines

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) | WhatsApp Web API |
| Google Gemini API | AI Chat & Question Generation |
| Pollinations AI | Image Generation (free) |
| MySQL | Persistent data storage |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MySQL Server
- Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### Installation

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/bot-whatsapp.git
cd bot-whatsapp

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Initialize database
mysql -u root < init.sql

# Run
node index.js
# Scan QR code with WhatsApp
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=wa_bot_db
```

## 📄 License

MIT License — feel free to fork and customize!

## 👤 Author

**Putra Irawan**

---

> Built with ❤️ and lots of ☕
