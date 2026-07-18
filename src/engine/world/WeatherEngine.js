const SimulationContext = require('./SimulationContext');
const DomainEvents = require('../core/DomainEvents');

/**
 * WeatherEngine
 * Mengatur cuaca secara deterministik berbasis Seed (Hari).
 * Menolak penggunaan Math.random() demi stabilitas antar-restart.
 */
class WeatherEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentWeather = 'Clear'; // or 'Sunny'
        this.targetWeather = 'Clear';
        this.currentDay = 1;
        this.currentHour = 0;

        this.eventBus.subscribe(DomainEvents.WorldTick, this.onWorldTick.bind(this));
    }

    onWorldTick(payload) {
        // Konversi dari akumulasi world ticks menjadi konsep Hari (Day)
        // Misalkan 1 hari = 1440 tick (jika 1 tick = 1 menit)
        // Untuk simulasi cepat, kita anggap 1 hari = 24 tick
        const tickCount = payload.totalTicks || 0;
        const newDay = Math.floor(tickCount / 24) + 1;
        const hour = tickCount % 24;
        
        let weatherChanged = false;

        // Tentukan target harian
        if (newDay !== this.currentDay || tickCount === 0) {
            this.currentDay = newDay;
            this.targetWeather = this._calculateDeterministicTargetWeather(this.currentDay);
        }

        // Setiap jam, transisi secara bertahap menuju target harian
        if (hour !== this.currentHour || tickCount === 0) {
            this.currentHour = hour;
            const newWeather = this._transitionWeather(this.currentWeather, this.targetWeather);
            
            if (newWeather !== this.currentWeather) {
                this.currentWeather = newWeather;
                weatherChanged = true;
            }
        }

        // Siapkan Context
        const context = new SimulationContext({
            day: this.currentDay,
            season: this._calculateSeason(this.currentDay),
            weather: this.currentWeather,
            hour: hour
        });

        // Selalu tembakkan event State Evolution (agar Behavior dan Snapshot bisa evaluasi)
        this.eventBus.publish('world.stateEvolution', {
            context,
            isSignificantChange: weatherChanged // Penanda bagi Snapshot Engine
        });
    }

    /**
     * @param {number} day 
     * @returns {string} Sunny, Rainy, Cloudy, Storm
     */
    _calculateDeterministicTargetWeather(day) {
        // Simple hash/modulo logic based on Day
        const season = this._calculateSeason(day);
        const seed = (day * 13) % 100; // Psuedo-random 0-99
        
        if (season === 'Rainy') {
            if (seed < 50) return 'Rain';
            if (seed < 80) return 'Cloudy';
            if (seed < 95) return 'Storm';
            return 'Sunny';
        } else {
            // Dry Season
            if (seed < 70) return 'Sunny';
            if (seed < 90) return 'Cloudy';
            return 'Rain';
        }
    }

    _transitionWeather(current, target) {
        if (current === target) return current;
        if (current === 'Clear') current = 'Sunny'; // normalize

        const states = ['Sunny', 'Cloudy', 'Rain', 'Storm'];
        const currentIndex = states.indexOf(current);
        const targetIndex = states.indexOf(target);

        if (currentIndex < targetIndex) {
            return states[currentIndex + 1];
        } else if (currentIndex > targetIndex) {
            return states[currentIndex - 1];
        }
        return current;
    }

    _calculateSeason(day) {
        // Misalkan 30 hari pertama Musim Hujan, 30 berikutnya Musim Kemarau
        return Math.floor((day - 1) / 30) % 2 === 0 ? 'Rainy' : 'Dry';
    }
}

module.exports = WeatherEngine;
