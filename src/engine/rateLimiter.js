/**
 * Rate Limiter Middleware
 * ======================
 * Sliding-window rate limiter to prevent command spam/abuse.
 * Each command can define its own rate limit configuration,
 * or fall back to a sensible default.
 * 
 * Design Patterns: Middleware/Decorator, Sliding Window Algorithm.
 * 
 * @example
 * const rateLimiter = require('./rateLimiter');
 * 
 * // Check if user is allowed to run a command
 * const result = rateLimiter.check(senderJid, 'imagine', { maxRequests: 2, windowMs: 60000 });
 * if (!result.allowed) {
 *     console.log(`Rate limited! Retry in ${result.retryAfterMs}ms`);
 * }
 */

/** @type {{ maxRequests: number, windowMs: number }} */
const DEFAULT_LIMIT = { maxRequests: 5, windowMs: 60_000 }; // 5 requests per 60 seconds

class RateLimiter {
    constructor() {
        /** @type {Map<string, { count: number, windowStart: number }>} */
        this.limits = new Map();
        this._startCleanup();
    }

    /**
     * Check if a user is allowed to execute a command.
     * Uses a fixed-window counter algorithm for simplicity and efficiency.
     * 
     * @param {string} senderJid - User's unique WhatsApp JID
     * @param {string} command - Command name (e.g., 'imagine', 'tebakgambar')
     * @param {object} [opts] - Rate limit configuration
     * @param {number} [opts.maxRequests=5] - Max requests allowed in the window
     * @param {number} [opts.windowMs=60000] - Window duration in milliseconds
     * @returns {{ allowed: boolean, retryAfterMs: number, remaining: number }}
     */
    check(senderJid, command, opts) {
        const config = { ...DEFAULT_LIMIT, ...(opts || {}) };
        const key = `${senderJid}:${command}`;
        const now = Date.now();

        let entry = this.limits.get(key);

        // No existing entry or window has expired → reset
        if (!entry || (now - entry.windowStart) >= config.windowMs) {
            entry = { count: 1, windowStart: now };
            this.limits.set(key, entry);
            return { 
                allowed: true, 
                retryAfterMs: 0, 
                remaining: config.maxRequests - 1 
            };
        }

        // Within window — check count
        if (entry.count < config.maxRequests) {
            entry.count++;
            return { 
                allowed: true, 
                retryAfterMs: 0, 
                remaining: config.maxRequests - entry.count 
            };
        }

        // Rate limited!
        const windowEnd = entry.windowStart + config.windowMs;
        const retryAfterMs = windowEnd - now;
        return { 
            allowed: false, 
            retryAfterMs, 
            remaining: 0 
        };
    }

    /**
     * Manually reset a user's rate limit for a specific command.
     * @param {string} senderJid
     * @param {string} command
     */
    reset(senderJid, command) {
        this.limits.delete(`${senderJid}:${command}`);
    }

    /**
     * Periodic cleanup of stale entries to prevent memory buildup.
     * Runs every 5 minutes.
     * @private
     */
    _startCleanup() {
        this._cleanupInterval = setInterval(() => {
            const now = Date.now();
            let cleaned = 0;

            for (const [key, entry] of this.limits) {
                // Remove entries whose window expired more than 2 minutes ago
                if ((now - entry.windowStart) > 120_000) {
                    this.limits.delete(key);
                    cleaned++;
                }
            }

            if (cleaned > 0) {
                console.log(`🧹 RateLimiter cleanup: removed ${cleaned} stale entries.`);
            }
        }, 300_000); // Every 5 minutes

        if (this._cleanupInterval.unref) {
            this._cleanupInterval.unref();
        }
    }
}

// Singleton export
module.exports = new RateLimiter();
