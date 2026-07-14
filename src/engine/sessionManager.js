/**
 * Session State Engine
 * ====================
 * Reusable in-memory state manager with TTL (Time-To-Live) support.
 * Used for managing game sessions, interactive flows, and any feature
 * that needs temporary state tied to a chat.
 * 
 * Design Patterns: Singleton, TTL-based caching, auto garbage collection.
 * 
 * @example
 * const session = require('./sessionManager');
 * session.create(chatJid, 'tebakgambar', { answer: 'kucing', points: 10 }, 30);
 * session.get(chatJid);     // { gameType, data, createdAt, expiresAt, ... }
 * session.destroy(chatJid); // cleanup
 */

class SessionManager {
    constructor() {
        /** @type {Map<string, SessionData>} */
        this.sessions = new Map();
        this._startGarbageCollector();
    }

    /**
     * Create a new session for a chat.
     * @param {string} chatJid - Unique chat identifier
     * @param {string} gameType - Type of game/feature (e.g., 'tebakgambar')
     * @param {object} data - Arbitrary session data
     * @param {number} [ttlSeconds=120] - Time-to-live in seconds
     * @returns {object} The created session
     */
    create(chatJid, gameType, data = {}, ttlSeconds = 120) {
        // Destroy existing session if any (prevent ghost sessions)
        if (this.sessions.has(chatJid)) {
            this.destroy(chatJid);
        }

        const now = Date.now();
        const session = {
            gameType,
            data,
            createdAt: now,
            expiresAt: now + (ttlSeconds * 1000),
            ttlSeconds
        };

        this.sessions.set(chatJid, session);
        console.log(`📦 Session created: [${gameType}] for ${chatJid} (TTL: ${ttlSeconds}s)`);
        return session;
    }

    /**
     * Get an active session for a chat.
     * Returns null if no session exists or if it has expired.
     * @param {string} chatJid
     * @returns {object|null}
     */
    get(chatJid) {
        const session = this.sessions.get(chatJid);
        if (!session) return null;

        // Auto-destroy expired sessions on access
        if (Date.now() > session.expiresAt) {
            this.destroy(chatJid);
            return null;
        }

        return session;
    }

    /**
     * Update session data (shallow merge).
     * @param {string} chatJid
     * @param {object} newData - Data to merge into existing session data
     * @returns {boolean} true if updated, false if session not found
     */
    update(chatJid, newData) {
        const session = this.get(chatJid);
        if (!session) return false;

        session.data = { ...session.data, ...newData };
        return true;
    }

    /**
     * Destroy a session and clean up any timers stored in its data.
     * @param {string} chatJid
     * @returns {boolean} true if destroyed, false if not found
     */
    destroy(chatJid) {
        const session = this.sessions.get(chatJid);
        if (!session) return false;

        // Clear any timeout stored in session data (critical for game timers)
        if (session.data) {
            if (session.data.timeoutId) clearTimeout(session.data.timeoutId);
            if (session.data.hintTimeoutId) clearTimeout(session.data.hintTimeoutId);
        }

        this.sessions.delete(chatJid);
        console.log(`🗑️ Session destroyed: [${session.gameType}] for ${chatJid}`);
        return true;
    }

    /**
     * Check if a chat has an active (non-expired) session.
     * @param {string} chatJid
     * @returns {boolean}
     */
    has(chatJid) {
        return this.get(chatJid) !== null;
    }

    /**
     * Get count of all active sessions (for monitoring/debugging).
     * @returns {number}
     */
    size() {
        return this.sessions.size;
    }

    /**
     * Auto garbage collector — sweeps expired sessions every 60 seconds.
     * Prevents memory leaks from sessions that were never explicitly destroyed
     * (e.g., bot crash during a game, network disconnect, etc.)
     * @private
     */
    _startGarbageCollector() {
        this._gcInterval = setInterval(() => {
            let cleaned = 0;
            const now = Date.now();

            for (const [jid, session] of this.sessions) {
                if (now > session.expiresAt) {
                    this.destroy(jid);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                console.log(`🧹 GC: Cleaned ${cleaned} expired session(s). Active: ${this.sessions.size}`);
            }
        }, 60_000); // Run every 60 seconds

        // Ensure GC doesn't prevent Node.js from exiting
        if (this._gcInterval.unref) {
            this._gcInterval.unref();
        }
    }
}

// Singleton — one instance shared across the entire bot
module.exports = new SessionManager();
