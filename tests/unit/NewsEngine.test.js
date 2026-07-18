const test = require('node:test');
const assert = require('node:assert/strict');
const EventBus = require('../../src/engine/core/EventBus');
const DomainEvents = require('../../src/engine/core/DomainEvents');
const RumorEngine = require('../../src/engine/rumor/RumorEngine');
const NewsEngine = require('../../src/engine/news/NewsEngine');

test('NewsEngine Unit Test', async (t) => {
    const eventBus = new EventBus();
    const rumorEngine = new RumorEngine(eventBus);
    const newsEngine = new NewsEngine(eventBus, rumorEngine);

    await t.test('1. Menghasilkan edisi kosong jika tidak ada rumor', () => {
        eventBus.publish(DomainEvents.DayPassed, { day: 1 });
        
        assert.ok(newsEngine.latestEdition);
        assert.equal(newsEngine.latestEdition.day, 1);
        assert.equal(newsEngine.latestEdition.id, 'edition_day_1');
        assert.equal(newsEngine.latestEdition.rumors.length, 0);
    });

    await t.test('2. Menghasilkan edisi dengan prioritas rumor (top 5)', () => {
        // Buat 10 rumor dengan kredibilitas dan heat berbeda
        for (let i = 1; i <= 10; i++) {
            rumorEngine.createFactionRumor('F_X', 'neutral', `Kejadian ${i}`);
            // Modifikasi rumor untuk testing priority
            const rumor = Array.from(rumorEngine.globalRumors.values()).pop();
            rumor.credibility = i * 10; // 10, 20, 30, ... 100
            rumor.heat = i;
        }

        eventBus.publish(DomainEvents.DayPassed, { day: 2 });
        
        const edition = newsEngine.latestEdition;
        assert.equal(edition.day, 2);
        assert.equal(edition.rumors.length, 5); // Hanya ambil top 5
        
        // Rumor pertama harus memiliki kredibilitas tertinggi (100)
        assert.equal(edition.rumors[0].credibility, 100);
        assert.ok(edition.rumors[0].rawText.includes('Kejadian 10'));
        
        // Rumor terakhir harus kredibilitas 60 (karena top 5 dari 100, 90, 80, 70, 60)
        assert.equal(edition.rumors[4].credibility, 60);
    });
});
