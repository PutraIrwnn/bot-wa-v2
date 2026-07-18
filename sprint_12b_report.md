# Sprint 12B Report

## Scope yang dikerjakan
- Implementasi penuh Faction sebagai Domain Aggregate (berdasarkan ADR-0021).
- Penambahan skema tabel `factions` dan modifikasi `npc_profiles` (menambah `faction_id`).
- Pembuatan Repositori Faksi (`IFactionRepository.js` dan `MySqlFactionRepository.js`).
- Pembuatan Faction Engine (orkestrator agregat faksi) dan Propagation Engine (menyebarkan reputasi secara asimetris ke NPC member berdasarkan trait penakut/pemberani secara deterministik).
- Penambahan Unit Test untuk `Faction.js` dan Integration Test untuk asimetri propagasi (`FactionAgency.test.js`).

## File yang diubah/ditambah
- `init_world.sql`
- `src/repository/MySqlNpcRepository.js`
- `src/repository/IFactionRepository.js` [NEW]
- `src/repository/MySqlFactionRepository.js` [NEW]
- `src/engine/core/DomainEvents.js`
- `src/engine/faction/Faction.js` [NEW]
- `src/engine/faction/FactionEngine.js` [NEW]
- `src/engine/faction/PropagationEngine.js` [NEW]
- `tests/unit/Faction.test.js` [NEW]
- `tests/integration/FactionAgency.test.js` [NEW]

Potongan kode inti `PropagationEngine.js`:
```javascript
async handlePropagation(payload) {
    const { factionId, deltaTrust } = payload;
    for (const npcId in this.npcEngine.npcs) {
        const npc = this.npcEngine.npcs[npcId];
        
        if (npc.faction_id === factionId) {
            let trustDelta = 0;
            let fearDelta = 0;
            const isCoward = npc.fear > 30;

            if (deltaTrust > 0) {
                if (isCoward) {
                    trustDelta = Math.floor(deltaTrust * 0.25);
                } else {
                    trustDelta = Math.floor(deltaTrust * 0.60);
                }
            } else if (deltaTrust < 0) {
                // ... penyesuaian deterministik negatif
            }
            
            // ... apply dan saveState
        }
    }
}
```

## Hasil test SEBELUM mulai (baseline)
```
ℹ tests 50
ℹ suites 0
ℹ pass 50
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6286.7126
```

## Hasil test SETELAH selesai (WAJIB tempel output asli)
```
▶ Faction Aggregate Root (Unit Test)
  ✔ 1. Inisialisasi Faksi Baru (1.6566ms)
  ✔ 2. Modifikasi Reputasi (0.4281ms)
  ✔ 3. Shared Knowledge (Rumor Ownership) (0.3547ms)
✔ Faction Aggregate Root (Unit Test) (5.0336ms)
◇ injected env (5) from .env // tip: ⌘ enable debugging { debug: true }
[INFO][MySQL] Connected to database successfully. {}
▶ Persistence Layer Integration Tests (MySQL)
  ✔ 1. Repository saveState() updates MySQL successfully (56.0602ms)
  ✔ 2. WorldRepository saves and loads JSON values (6.4122ms)
[NPCEngine] Loaded 1 NPCs from repository.
  ✔ 3. NPCEngine integrates with Repository for Recovery (4.1986ms)
✔ Persistence Layer Integration Tests (MySQL) (70.744ms)
ℹ tests 56
ℹ suites 0
ℹ pass 56
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6281.2134
```

## Regresi terdeteksi (kalau ada)
Tidak ada regresi, seluruh `tests 56` berstatus PASS.
(Note: Sempat terjadi fail lokal sementara sebelum tabel fisik di MariaDB di-ALTER, namun setelah schema diaplikasikan menggunakan UoW/script scratch `update_db.js`, 100% tes kembali hijau).

## Usul teknis (kalau ada, sesuai batasan "Ruang Usul")
- Pada `PropagationEngine`, trait "isCoward" hanya meninjau skor dasar `fear` milik NPC untuk saat ini. Di masa depan (mungkin Sprint 13 - Personality), kita perlu memisahkan `fear` (sebagai respon state emosi temporer) dari `courage/cowardice` (sebagai personality trait permanen).

## Belum dikerjakan / diketahui belum sempurna
- NPC saat ini hanya men-support *Satu Faksi Utama* via `faction_id`. Fitur multi-faction tidak dikerjakan demi kelancaran kalkulasi Propagation.
