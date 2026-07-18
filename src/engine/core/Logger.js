/**
 * Logger Abstraction
 * Abstraksi untuk Level 1 Operational Errors dan diagnostics.
 */
class Logger {
    constructor(moduleName = 'System') {
        this.moduleName = moduleName;
    }

    info(message, context = {}) {
        // Ke depannya bisa dilempar ke file / ELK stack
        console.log(`[INFO][${this.moduleName}] ${message}`, context);
    }

    warn(message, context = {}) {
        console.warn(`[WARN][${this.moduleName}] ${message}`, context);
    }

    /**
     * Digunakan untuk Level 1 Operational Error (misal: MySQL failure).
     * Error ini dicatat tapi TIDAK memicu Domain Event karena belum tentu merubah state sistem.
     */
    error(message, errorObj = null, context = {}) {
        const errorMsg = errorObj ? (errorObj.message || errorObj) : '';
        console.error(`[ERROR][${this.moduleName}] ${message} ${errorMsg}`, context);
        // TODO: Tulis ke file error.log
    }
}

module.exports = Logger;
