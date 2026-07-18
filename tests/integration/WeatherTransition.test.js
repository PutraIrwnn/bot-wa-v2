const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const WeatherEngine = require('../../src/engine/world/WeatherEngine');

test('WeatherEngine: Gradual Transition', async (t) => {
    const eventBus = new EventBus();
    const weatherEngine = new WeatherEngine(eventBus);

    weatherEngine.currentWeather = 'Sunny';
    
    // Target is Storm (Index 3). Current is Sunny (Index 0).
    const step1 = weatherEngine._transitionWeather('Sunny', 'Storm');
    assert.equal(step1, 'Cloudy');

    const step2 = weatherEngine._transitionWeather('Cloudy', 'Storm');
    assert.equal(step2, 'Rain');

    const step3 = weatherEngine._transitionWeather('Rain', 'Storm');
    assert.equal(step3, 'Storm');

    const step4 = weatherEngine._transitionWeather('Storm', 'Sunny');
    assert.equal(step4, 'Rain');
});
