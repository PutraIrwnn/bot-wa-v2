const test = require('node:test');
const assert = require('node:assert/strict');
const ActionEngine = require('../../src/engine/core/ActionEngine');
const PlayerFactionRelationship = require('../../src/engine/faction/PlayerFactionRelationship');
const RumorDTO = require('../../src/engine/rumor/RumorDTO');

test('Player Command Surface (Sprint 16)', async (t) => {
    // Setup Mock Engines
    const mockNpcEngine = {
        npcs: {
            'budi': { name: 'Budi', trustNetwork: { 'player1': 85, 'player2': 10 } },
            'rina': { name: 'Rina', trustNetwork: {} }
        }
    };

    const mockFactionEngine = {
        factions: {
            'F_GUARD': { name: 'Garda Kota' },
            'F_MERCHANT': { name: 'Serikat Pedagang' }
        },
        playerRelations: {
            'player1_F_GUARD': {
                playerId: 'player1',
                factionId: 'F_GUARD',
                trust: 40,
                trustLevel: 'Friendly'
            }
        },
        _getRelKey: (p, f) => `${p}_${f}`
    };

    const mockRumorEngine = {
        globalRumors: new Map()
    };

    const actionEngine = new ActionEngine(
        {}, // eventBus
        mockNpcEngine,
        {}, // exploreEngine
        null, // promptEngine
        mockFactionEngine,
        mockRumorEngine
    );

    await t.test('1. Command !reputasi', async (st) => {
        // Success case
        const res1 = await actionEngine.handleAction({ command: 'reputasi', args: ['budi'], player: 'player1' });
        assert.ok(res1.messages[0].includes('Sangat Percaya'), 'Player1 harus Sangat Percaya dengan trust 85');

        // Bad rep case
        const res2 = await actionEngine.handleAction({ command: 'reputasi', args: ['budi'], player: 'player2' });
        assert.ok(res2.messages[0].includes('Bermusuhan'), 'Player2 harus Bermusuhan dengan trust 10');

        // Edge case: Empty / Not found
        const resEmpty = await actionEngine.handleAction({ command: 'reputasi', args: [], player: 'player1' });
        assert.ok(resEmpty.messages[0].includes('Cek reputasi dengan siapa?'), 'Harus meminta target jika argumen kosong');

        const resNotFound = await actionEngine.handleAction({ command: 'reputasi', args: ['joko'], player: 'player1' });
        assert.ok(resNotFound.messages[0].includes('Tidak ada yang bernama'), 'Harus handle NPC tidak ditemukan');
    });

    await t.test('2. Command !faksi', async (st) => {
        // Cek faksi spesifik (ada data)
        const res1 = await actionEngine.handleAction({ command: 'faksi', args: ['F_GUARD'], player: 'player1' });
        assert.ok(res1.messages[0].includes('Garda Kota'), 'Harus menampilkan nama faksi Garda Kota');
        assert.ok(res1.messages[0].includes('Friendly'), 'Harus menampilkan trust level Friendly');

        // Cek faksi spesifik (belum ada data)
        const resNoData = await actionEngine.handleAction({ command: 'faksi', args: ['F_MERCHANT'], player: 'player1' });
        assert.ok(resNoData.messages[0].includes('belum memiliki interaksi berarti'), 'Harus gracefully handle faksi yang belum pernah interaksi');

        // Cek faksi salah/tidak ada
        const resNotFound = await actionEngine.handleAction({ command: 'faksi', args: ['F_ALIEN'], player: 'player1' });
        assert.ok(resNotFound.messages[0].includes('tidak diketahui'), 'Harus handle faksi invalid');

        // Cek daftar semua faksi (player1 punya 1 relasi)
        const resList = await actionEngine.handleAction({ command: 'faksi', args: [], player: 'player1' });
        assert.ok(resList.messages[0].includes('Garda Kota'), 'Daftar harus mencantumkan Garda Kota');

        // Cek daftar semua faksi (player belum punya sama sekali)
        const resEmptyList = await actionEngine.handleAction({ command: 'faksi', args: [], player: 'player3' });
        assert.ok(resEmptyList.messages[0].includes('belum berafiliasi'), 'Harus handle pemain baru yang belum berelasi');
    });

    await t.test('3. Command !rumor', async (st) => {
        // Kondisi 1: Belum ada rumor
        const resEmpty = await actionEngine.handleAction({ command: 'rumor', args: [], player: 'player1' });
        assert.ok(resEmpty.messages[0].includes('Jalanan sepi'), 'Harus info jalanan sepi jika rumor Map kosong');

        // Tambah rumor
        mockRumorEngine.globalRumors.set('r1', new RumorDTO({ id: 'r1', originEvent: 'TEST', rawText: 'Pencuri beraksi!', credibility: 95 }));
        mockRumorEngine.globalRumors.set('r2', new RumorDTO({ id: 'r2', originEvent: 'TEST', rawText: 'Cuaca buruk beso!', credibility: 40 }));
        
        // Kondisi 2: Ada rumor
        const resFull = await actionEngine.handleAction({ command: 'rumor', args: [], player: 'player1' });
        assert.ok(resFull.messages[0].includes('Pencuri beraksi!'), 'Harus memuat teks rumor');
        assert.ok(resFull.messages[0].includes('Kredibilitas: 95%'), 'Harus memuat angka kredibilitas');
    });
});
