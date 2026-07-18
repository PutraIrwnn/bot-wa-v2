const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const WorldEngine = require('../../src/engine/world/WorldEngine');
const DomainEvents = require('../../src/engine/core/DomainEvents');

class MockWorldRepo {
    constructor(missedMs) {
        this.missedMs = missedMs;
        this.state = { last_tick_time: Date.now() - missedMs };
        this.savedTicks = [];
    }
    async loadState() {
        return this.state;
    }
    async saveState(key, val) {
        this.state[key] = val;
        this.savedTicks.push(val);
    }
}

test('Hybrid World Time: Passive Tick (Catch-Up) Test', async (t) => {
    await t.test('WorldEngine simulates missed time as rapid passive ticks', async () => {
        const eventBus = new EventBus();
        
        let tickCount = 0;
        let wasPassive = false;
        
        eventBus.subscribe(DomainEvents.WorldTick, async (payload) => {
            tickCount++;
            if (payload.isPassive) wasPassive = true;
        });

        // Simulasi server mati selama 3 menit (180000 ms). Karena interval 60000ms (1 menit), maka harus ada 3 missed ticks.
        const mockRepo = new MockWorldRepo(180000); 
        const worldEngine = new WorldEngine(eventBus, mockRepo);
        
        // Memaksa interval ms jadi statis untuk tes ini, atau biarkan default 60000
        await worldEngine.init(); // Execute Passive Tick

        // Verifikasi bahwa 3 tick telah dikirimkan secara instan
        assert.equal(tickCount, 3, 'Gagal melakukan simulasi 3 missed ticks');
        assert.equal(wasPassive, true, 'Event tidak ditandai sebagai passive tick');
        
        // Verifikasi LastWorldUpdate telah diubah
        assert.ok(mockRepo.state['last_tick_time'] > Date.now() - 1000, 'Waktu terakhir tidak di-update');
    });
});
