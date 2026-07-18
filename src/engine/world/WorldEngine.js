const DomainEvents = require('../core/DomainEvents');

/**
 * WorldEngine
 * Engine khusus untuk simulasi waktu dunia. Menggunakan pola Hybrid World Time.
 * Waktu adalah domain concept. Timer interval hanyalah pemicu event.
 */
class WorldEngine {
    constructor(eventBus, worldRepository) {
        this.eventBus = eventBus;
        this.worldRepository = worldRepository;
        this.tickIntervalMs = 60000; // 1 menit (misal)
        this.intervalTimer = null;
        this.lastWorldUpdate = 0;
        this.totalTicks = 0;
    }

    /**
     * Memuat waktu terakhir dari database, lalu melakukan Catch-Up (Passive Tick)
     */
    async init() {
        const state = await this.worldRepository.loadState();
        this.lastWorldUpdate = state['last_tick_time'] || Date.now();
        this.totalTicks = state['total_ticks'] || 0;

        // Lakukan Passive Tick (Simulasi offline)
        await this._simulateCatchUp();
    }

    /**
     * Passive Tick: Mensimulasikan waktu saat server offline
     */
    async _simulateCatchUp() {
        const now = Date.now();
        const elapsed = now - this.lastWorldUpdate;
        
        const missedTicks = Math.floor(elapsed / this.tickIntervalMs);
        
        if (missedTicks > 0) {
            // Kita tembakkan secara berurutan agar dunia merespons
            // Jika missedTicks sangat besar, kita bisa membatasi misal maks 100 ticks
            const safeTicks = Math.min(missedTicks, 100); 
            
            for (let i = 0; i < safeTicks; i++) {
                this.totalTicks++;
                this.eventBus.publish(DomainEvents.WorldTick, { isPassive: true, totalTicks: this.totalTicks });
            }
            
            this.lastWorldUpdate = now;
            await this.worldRepository.saveState('last_tick_time', this.lastWorldUpdate);
            await this.worldRepository.saveState('total_ticks', this.totalTicks);
        }
    }

    /**
     * Active Tick: Memulai timer interval ketika server aktif
     */
    startSimulation() {
        if (this.intervalTimer) return;

        this.intervalTimer = setInterval(() => {
            this.lastWorldUpdate = Date.now();
            this.totalTicks++;
            this.eventBus.publish(DomainEvents.WorldTick, { isPassive: false, totalTicks: this.totalTicks });
            
            // Simpan waktu sesekali (tidak dipedulikan await-nya karena async fire and forget)
            this.worldRepository.saveState('last_tick_time', this.lastWorldUpdate).catch(() => {});
            this.worldRepository.saveState('total_ticks', this.totalTicks).catch(() => {});
        }, this.tickIntervalMs);
    }

    stopSimulation() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
    }
}

module.exports = WorldEngine;
