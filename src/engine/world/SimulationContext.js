/**
 * SimulationContext
 * Kontrak resmi untuk mengevaluasi state dunia secara deterministik.
 * Dihasilkan dari konversi "waktu" ke "fakta lingkungan".
 */
class SimulationContext {
    /**
     * @param {Object} args
     * @param {number} args.day - Hari simulasi berjalan (mulai dari 1)
     * @param {string} args.season - Musim saat ini (Spring, Summer, Autumn, Winter)
     * @param {string} args.weather - Cuaca saat ini (Sunny, Rainy, Cloudy, dll)
     * @param {number} args.hour - Jam dunia saat ini (0-23)
     */
    constructor({ day, season, weather, hour }) {
        this.day = day;
        this.season = season;
        this.weather = weather;
        this.hour = hour;
        
        Object.freeze(this);
    }
}

module.exports = SimulationContext;
