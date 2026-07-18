const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');

test('EventBus Contract & Hardening Tests', async (t) => {
    
    await t.test('1. publish() calls all registered listeners', () => {
        const bus = new EventBus();
        let callCount = 0;
        
        bus.subscribe('test.event', () => callCount++);
        bus.subscribe('test.event', () => callCount++);
        bus.subscribe('test.event', () => callCount++);
        
        bus.publish('test.event');
        assert.equal(callCount, 3, 'All 3 listeners should be called');
    });

    await t.test('2. publish() does not throw even if a listener throws synchronously', () => {
        const bus = new EventBus();
        let called = false;
        
        bus.subscribe('test.error', () => { throw new Error('Sync Error!'); });
        bus.subscribe('test.error', () => { called = true; });
        
        // This should not throw
        assert.doesNotThrow(() => bus.publish('test.error'));
        assert.equal(called, true, 'Subsequent listener should still execute');
    });

    await t.test('3. publish() isolates async promise rejections', async () => {
        const bus = new EventBus();
        let called = false;
        
        bus.subscribe('test.asyncError', async () => {
            throw new Error('Async Error!');
        });
        bus.subscribe('test.asyncError', async () => {
            called = true;
        });
        
        bus.publish('test.asyncError');
        
        // Wait a tick to allow promises to resolve/reject
        await new Promise(resolve => setTimeout(resolve, 10));
        assert.equal(called, true, 'Async listener failure must not stop others');
    });

    await t.test('4. Async Fire-and-Forget (No blocking)', async () => {
        const bus = new EventBus();
        let slowFinished = false;
        let fastFinished = false;

        bus.subscribe('test.speed', async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            slowFinished = true;
        });

        bus.subscribe('test.speed', () => {
            fastFinished = true;
        });

        // Publish happens synchronously from caller's perspective
        bus.publish('test.speed');
        
        // Immediately after publish, slow listener is NOT finished, but fast is
        assert.equal(slowFinished, false, 'Slow listener should still be running');
        assert.equal(fastFinished, true, 'Fast listener should have executed synchronously up to its first await (if it had one, or fully if sync)');
        
        // Wait for slow to finish just to clean up
        await new Promise(resolve => setTimeout(resolve, 60));
        assert.equal(slowFinished, true);
    });

    await t.test('5. Event Ordering (Synchronous Dispatch)', () => {
        const bus = new EventBus();
        const order = [];

        bus.subscribe('event.A', () => order.push('A'));
        bus.subscribe('event.B', () => order.push('B'));
        bus.subscribe('event.C', () => order.push('C'));

        bus.publish('event.A');
        bus.publish('event.B');
        bus.publish('event.C');

        assert.deepEqual(order, ['A', 'B', 'C'], 'Events must be dispatched in the exact order they are published');
    });

    await t.test('6. once() listener is automatically disposed after 1 call', () => {
        const bus = new EventBus();
        let count = 0;
        
        bus.once('test.once', () => count++);
        
        bus.publish('test.once');
        bus.publish('test.once');
        
        assert.equal(count, 1, 'once() listener should only execute exactly one time');
        assert.equal(bus.listenerCount('test.once'), 0, 'Listener should be removed from bus after first call');
    });

    await t.test('7. Memory Leak Test: 10,000x subscribe/dispose cycles', () => {
        const bus = new EventBus();
        
        for (let i = 0; i < 10000; i++) {
            const dispose = bus.subscribe('test.memory', () => {});
            dispose();
        }
        
        assert.equal(bus.listenerCount('test.memory'), 0, 'listenerCount must be exactly 0 after 10000 dispose calls');
    });
});
