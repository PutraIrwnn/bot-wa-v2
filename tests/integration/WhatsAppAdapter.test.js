const test = require('node:test');
const assert = require('node:assert/strict');
const WhatsAppAdapter = require('../../src/adapter/whatsapp/WhatsAppAdapter');

test('WhatsAppAdapter Idempotency Test', async (t) => {
    // Mock dependencies
    const mockRouter = { parse: (text, sender) => ({ command: 'dummy' }) };
    
    let execCount = 0;
    const mockActionEngine = { 
        handleAction: async () => {
            execCount++;
            return { text: 'ok' };
        }
    };
    const mockMessageAdapter = { 
        extractText: () => '!dummy',
        extractSenderId: () => '123',
        formatResponse: () => ({ text: 'ok' })
    };

    const adapter = new WhatsAppAdapter(mockRouter, mockActionEngine, mockMessageAdapter);
    
    // Bypass connect and directly test message handling callback
    // We will extract the callback bound to 'messages.upsert'
    let handler = null;
    adapter.sock = {
        ev: { on: (event, cb) => { if (event === 'messages.upsert') handler = cb; } },
        sendPresenceUpdate: async () => {},
        sendMessage: async () => {} // Mock send to prevent queue from failing
    };
    
    // Setup dummy connection listeners to avoid crash during setup
    const dummyEv = { on: (event, cb) => { if (event === 'messages.upsert') handler = cb; } };
    adapter.sock.ev = dummyEv;
    
    // Call the handler directly
    // Wait, the handler is registered in connect(). Let's just override isDuplicate for a quick check.
    
    // Direct test of isDuplicate
    await t.test('isDuplicate properly tracks and limits cache size', () => {
        assert.equal(adapter.isDuplicate('msg_1'), false);
        assert.equal(adapter.isDuplicate('msg_1'), true); // Duplicate
        
        // Push 100 more messages to overflow the cache (MAX_CACHE_SIZE = 100)
        for (let i = 2; i <= 102; i++) {
            adapter.isDuplicate(`msg_${i}`);
        }
        
        // 'msg_1' should be evicted and no longer considered duplicate
        assert.equal(adapter.isDuplicate('msg_1'), false);
    });
});
