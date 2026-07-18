const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const WeatherEngine = require('../../src/engine/world/WeatherEngine');

test('Deterministic Weather: Weather is calculated identically on the same day without Math.random()', async (t) => {
    await t.test('Seed based weather returns consistent results for a given day', () => {
        const eventBus = new EventBus();
        const weatherEngine1 = new WeatherEngine(eventBus);
        const weatherEngine2 = new WeatherEngine(eventBus);

        // Uji hari ke 25
        const day25Weather1 = weatherEngine1._calculateDeterministicTargetWeather(25);
        const day25Weather2 = weatherEngine2._calculateDeterministicTargetWeather(25);
        assert.equal(day25Weather1, day25Weather2, 'Cuaca tidak deterministik untuk hari yang sama');

        // Uji hari ke 60
        const day60Weather1 = weatherEngine1._calculateDeterministicTargetWeather(60);
        const day60Weather2 = weatherEngine2._calculateDeterministicTargetWeather(60);
        assert.equal(day60Weather1, day60Weather2, 'Cuaca tidak deterministik untuk hari yang sama');
    });

    await t.test('Weather changes affect SimulationContext event', async () => {
        const eventBus = new EventBus();
        const weatherEngine = new WeatherEngine(eventBus);

        let eventCount = 0;
        let lastContext = null;

        eventBus.subscribe('world.stateEvolution', (payload) => {
            eventCount++;
            lastContext = payload.context;
        });

        // Trigger hari ke-1 (0 ticks)
        weatherEngine.onWorldTick({ totalTicks: 0 });
        assert.equal(eventCount, 1);
        assert.equal(lastContext.day, 1);

        // Trigger hari ke-2 (24 ticks)
        weatherEngine.onWorldTick({ totalTicks: 24 });
        assert.equal(eventCount, 2);
        assert.equal(lastContext.day, 2);
    });
});
