/**
 * WorldSnapshotDTO
 * Menyimpan representasi keadaan dunia pada satu waktu tertentu.
 * Snapshot historis hanya diciptakan saat ada transisi signifikan (cuaca, populasi).
 * Snapshot terkini (Current Snapshot) di-upsert setiap siklus untuk AI context.
 */
class WorldSnapshotDTO {
    /**
     * @param {Object} data 
     * @param {number} data.timestamp - Waktu nyata snapshot diambil
     * @param {number} data.day - Hari simulasi (e.g., 25)
     * @param {string} data.weather - Cuaca saat snapshot (e.g., 'Rain')
     * @param {number} data.market_population - Jumlah NPC yang ada di pasar
     * @param {number} data.active_rumors - Jumlah rumor aktif
     */
    constructor({ timestamp, day, weather, market_population, active_rumors }) {
        this.timestamp = timestamp || Date.now();
        this.day = day || 1;
        this.weather = weather || 'Clear';
        this.market_population = market_population || 0;
        this.active_rumors = active_rumors || 0;
        
        Object.freeze(this);
    }
}

module.exports = WorldSnapshotDTO;
