const test = require('node:test');
const assert = require('node:assert/strict');
const NarrationSanitizer = require('../../src/engine/ai/NarrationSanitizer');

test('NarrationSanitizer Unit Test', async (t) => {
    const sanitizer = new NarrationSanitizer();

    await t.test('1. Menghapus AI-isms (Basa-basi chatbot)', () => {
        const input = "Tentu, berikut adalah narasinya:\n*Budi tersenyum.* \"Halo!\"";
        const result = sanitizer.sanitize(input);
        assert.equal(result, '*Budi tersenyum.* "Halo!"');
    });

    await t.test('2. Menghapus kebocoran statistik mekanikal (dalam kurung)', () => {
        const input = "*Rina menghela napas.* [Trust: 80] \"Aku lelah.\" (Memory: 20)";
        const result = sanitizer.sanitize(input);
        assert.equal(result, '*Rina menghela napas.* "Aku lelah."');
    });

    await t.test('3. Menghapus kebocoran statistik mekanikal (tanpa kurung)', () => {
        const input = "Trust: 90. *Dia menyapa.*";
        const result = sanitizer.sanitize(input);
        assert.equal(result, '. *Dia menyapa.*');
    });
});
