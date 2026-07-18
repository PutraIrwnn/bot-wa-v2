# Sprint 13 Report (Faction Conflict & Diplomacy)

## Scope yang dikerjakan
- Melanjutkan pengembangan Social Depth dengan fokus **Relasi Antar Faksi** (Rival/Ally).
- Penambahan struktur database untuk menampung inter-faction relationships (tabel `faction_relationships`).
- Penambahan Repositori terkait (`IFactionRelationshipRepository.js`, `MySqlFactionRelationshipRepository.js`).
- Pengembangan *DiplomacyEngine* yang bekerja secara *event-driven*, mendengarkan `WorldEventOccurred` dari *EventBus* untuk memperbarui Trust dan Tension antar faksi.
- Penambahan domain object `FactionRelationship.js` dengan kalkulasi deterministik (Contoh: `Tension > 75` && `Trust < 30` = RIVAL).
- Penulisan Unit Test `FactionRelationship.test.js` dan Integration Test `DiplomacyAgency.test.js`.

## File yang diubah/ditambah
- `init_world.sql`
- `update_db.js` (Scratch script, local migration)
- `src/repository/IFactionRelationshipRepository.js` [NEW]
- `src/repository/MySqlFactionRelationshipRepository.js` [NEW]
- `src/engine/core/DomainEvents.js`
- `src/engine/faction/FactionRelationship.js` [NEW]
- `src/engine/faction/DiplomacyEngine.js` [NEW]
- `tests/unit/FactionRelationship.test.js` [NEW]
- `tests/integration/DiplomacyAgency.test.js` [NEW]

**Cuplikan `DiplomacyEngine.js` (Reaksi terhadap Event Dunia):**
```javascript
async handleWorldEvent(payload) {
    const { type, factionA, factionB, reason } = payload;
    let deltaTrust = 0; let deltaTension = 0;

    switch (type) {
        case 'RESOURCE_DISPUTE':
            deltaTrust = -15; deltaTension = 20;
            break;
        case 'TRADE_AGREEMENT':
            deltaTrust = 20; deltaTension = -10;
            break;
    }
    if (deltaTrust !== 0 || deltaTension !== 0) {
        await this._applyRelationshipChange(factionA, factionB, deltaTrust, deltaTension, reason);
        await this._applyRelationshipChange(factionB, factionA, deltaTrust, deltaTension, reason);
    }
}
```

## Hasil test SEBELUM mulai (baseline)
```
ℹ tests 56
ℹ suites 0
ℹ pass 56
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6337.5964
```

## Hasil test SETELAH selesai (WAJIB tempel output asli)
```
▶ DiplomacyEngine & World Events (Integration Test)
  ✔ 1. RESOURCE_DISPUTE creates tension and may form rivalry (67.9234ms)
✔ DiplomacyEngine & World Events (Integration Test) (71.7363ms)

... [test lainnya dihilangkan untuk efisiensi ruang baca] ...

▶ FactionRelationship Domain Logic (Unit Test)
  ✔ 1. Inisialisasi Default (Neutral) (1.7134ms)
  ✔ 2. Transisi Neutral -> Rival (0.515ms)
  ✔ 3. Transisi Neutral -> Ally (0.4319ms)
  ✔ 4. Transisi Rival -> Neutral (Recovery) (0.4845ms)
✔ FactionRelationship Domain Logic (Unit Test) (6.1397ms)

ℹ tests 63
ℹ suites 0
ℹ pass 63
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6260.6068
```

## Regresi terdeteksi (kalau ada)
Tidak ada regresi. Seluruh komponen inti dan *event-driven logic* eksisting tetap hijau bersama penambahan fitur *DiplomacyEngine*. 

## Usul teknis (kalau ada, sesuai batasan "Ruang Usul")
- *WorldEvent* (seperti `RESOURCE_DISPUTE`) saat ini ditambahkan secara generik dan ditembak lewat REPL/Test. Di Sprint berikutnya, mungkin kita butuh *WorldEventGenerator* kecil jika event dunia akan ditrigger otomatis setiap hari, atau ini tetap diserahkan kepada *ActionEngine* (keputusan narator / Rule Engine utama).

## Belum dikerjakan / diketahui belum sempurna
- Seperti kesepakatan dalam implementasi: Status RIVAL antar Faksi **belum** merambat (propagate) menjadi rasa benci (*Fear/Minus Trust*) individu secara otomatis antar anggota faksi, untuk menghindari *complexity compounding* prematur. Fokusnya murni di makro.
