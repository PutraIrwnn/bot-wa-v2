const EventBus = require('../../src/engine/core/EventBus');
const { performance } = require('perf_hooks');

const runBenchmark = (subscriberCount) => {
    const bus = new EventBus();
    const eventName = 'test.bench';
    
    // Register N subscribers
    for (let i = 0; i < subscriberCount; i++) {
        bus.subscribe(eventName, () => {
            // Do some light synchronous work
            const a = 1 + 1;
        });
    }

    // Measure publish latency
    const start = performance.now();
    bus.publish(eventName);
    const end = performance.now();

    const latencyMs = (end - start).toFixed(4);
    console.log(`${subscriberCount} subscribers:\t ${latencyMs} ms`);
};

console.log('--- EventBus Publish Benchmark (Fire-and-forget latency) ---');
console.log('Observation only, not meant for CI assertions.\n');

runBenchmark(10);
runBenchmark(100);
runBenchmark(1000);
runBenchmark(5000);
runBenchmark(10000);
