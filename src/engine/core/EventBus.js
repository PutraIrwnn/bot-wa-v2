/**
 * Event Bus (Pub/Sub) untuk Aetheria.
 * 
 * CONTRACT GUARANTEES:
 * - Semua listener yang terdaftar pasti dipanggil saat publish().
 * - Listener yang gagal/throw (sync atau async) TIDAK AKAN menghentikan eksekusi listener lain.
 * - publish() TIDAK AKAN melempar exception (Safe to call).
 * - Event dipublish secara berurutan, namun eksekusi listener (jika async) bersifat fire-and-forget.
 * 
 * NON-GUARANTEES:
 * - publish() tidak menunggu listener selesai (non-blocking).
 * - Tidak ada mekanisme retry untuk listener yang gagal.
 */
const Logger = require('./Logger');

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.logger = new Logger('EventBus');
    }

    /**
     * Subscribe ke sebuah event
     * @param {string} eventName - Nama event (Misal: 'player.helpedNpc')
     * @param {Function} callback - Fungsi listener
     * @returns {Function} dispose - Fungsi untuk unsubscribe dan membersihkan memori
     */
    subscribe(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        
        const callbacks = this.listeners.get(eventName);
        callbacks.add(callback);

        // Return fungsi dispose untuk mencegah memory leak
        return () => {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.listeners.delete(eventName);
            }
        };
    }

    /**
     * Subscribe yang otomatis dispose setelah dipanggil satu kali.
     * @param {string} eventName 
     * @param {Function} callback 
     * @returns {Function} dispose
     */
    once(eventName, callback) {
        const dispose = this.subscribe(eventName, (...args) => {
            dispose();
            return callback(...args);
        });
        return dispose;
    }

    /**
     * Mendapatkan jumlah listener aktif untuk sebuah event.
     * Sangat berguna untuk diagnostics dan mendeteksi memory leak.
     * @param {string} eventName 
     * @returns {number}
     */
    listenerCount(eventName) {
        if (!this.listeners.has(eventName)) return 0;
        return this.listeners.get(eventName).size;
    }

    /**
     * Publish sebuah event secara Fire-and-Forget
     * @param {string} eventName 
     * @param {Object} payload 
     */
    publish(eventName, payload = {}) {
        if (!this.listeners.has(eventName)) return;

        const callbacks = this.listeners.get(eventName);
        
        for (const callback of callbacks) {
            try {
                // Promise.resolve menjamin callback synchronous diubah menjadi Promise,
                // sehingga kita bisa menggunakan .catch untuk mengamankan UnhandledPromiseRejection.
                Promise.resolve(callback(payload)).catch(err => {
                    // Level 1 Operational Error (Async)
                    this.logger.error(`Async error in listener for event '${eventName}':`, err);
                });
            } catch (err) {
                // Level 1 Operational Error (Sync)
                this.logger.error(`Sync error in listener for event '${eventName}':`, err);
            }
        }
    }
    
    /**
     * Bersihkan semua listener (Hanya untuk keperluan Testing)
     */
    clearAll() {
        this.listeners.clear();
    }
}

module.exports = EventBus;
