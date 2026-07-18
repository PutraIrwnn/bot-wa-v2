# Sprint 14 Report (Player Reputation di Mata Faksi)

## Scope yang dikerjakan
- Implementasi penuh standing/reputasi terpisah antara Pemain dan Faksi.
- Refactor *Single Source of Truth* (SSOT): Menghapus `reputation_profile` JSON dari `factions` table (Sprint 12B) dan memindahkannya secara fisik ke tabel baru `player_faction_relationships` yang memiliki *Immutable History Log* (layaknya `Relationship.js`).
- Penambahan Repositori baru `IPlayerFactionRelationshipRepository.js` dan implementasinya.
- Penambahan *event-driven listener* pada `NPCEngine.js` di mana interaksi bantuan (`PlayerHelpedNpc`) akan dipropagasikan menjadi event `PlayerFactionInteraction` dengan bobot yang diperkecil (misal: individu +10, faksi +5).
- Penambahan Unit Test `PlayerFactionRelationship.test.js` dan Integration Test `PlayerFactionAgency.test.js`.

## File yang diubah/ditambah
- `init_world.sql`
- `update_db.js` (Menjalankan `DROP COLUMN` dan `CREATE TABLE`)
- `src/repository/MySqlFactionRepository.js`
- `src/engine/faction/Faction.js`
- `src/engine/npc/NPCEngine.js`
- `src/engine/faction/FactionEngine.js`
- `src/repository/IPlayerFactionRelationshipRepository.js` [NEW]
- `src/repository/MySqlPlayerFactionRelRepository.js` [NEW]
- `src/engine/faction/PlayerFactionRelationship.js` [NEW]
- `tests/unit/PlayerFactionRelationship.test.js` [NEW]
- `tests/integration/PlayerFactionAgency.test.js` [NEW]
- `tests/unit/Faction.test.js` (Memperbaiki error deprecated method)
- `tests/integration/FactionAgency.test.js` (Memperbaiki error deprecated method)

**Konsep Utama (Propagasi Reputasi):**
```javascript
// Di NPCEngine.js
if (npc.faction_id) {
    this.eventBus.publish(DomainEvents.PlayerFactionInteraction, {
        factionId: npc.faction_id,
        playerId: fact.player,
        deltaTrust: 5, // Faction trust naik lebih lambat 50%
        reason: `Membantu anggota faksi: ${npc.name}`,
        currentDay: fact.day || 1
    });
}
```

## Hasil test SEBELUM mulai (baseline)
```
ℹ tests 63
ℹ suites 0
ℹ pass 63
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6262.0748
```

## Hasil test SETELAH selesai (WAJIB tempel output asli)
```
[NPCEngine] Loaded 1 NPCs from repository.
[NPCEngine] Budi ditolong oleh P1. Trust: 60, Memory: 100
▶ Player Faction Reputation Propagation (Integration Test)
  ✔ 1. PlayerHelpedNpc triggers PlayerFactionInteraction and updates repo (36.2935ms)
✔ Player Faction Reputation Propagation (Integration Test) (41.5541ms)

▶ PlayerFactionRelationship Domain Logic (Unit Test)
  ✔ 1. Inisialisasi Default (2.4004ms)
  ✔ 2. Menambah histori interaksi positif (0.5481ms)
  ✔ 3. Limit trust bounds (0-100) (0.3294ms)
✔ PlayerFactionRelationship Domain Logic (Unit Test) (5.762ms)

ℹ tests 68
ℹ suites 0
ℹ pass 68
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6252.5556
```

## Regresi terdeteksi (kalau ada)
Saat integrasi, sempat terdeteksi **kegagalan** di 2 test suite lama (`Faction.test.js` dan `FactionAgency.test.js`) karena method lama (`getReputation` dan `updateReputation`) yang sudah dibuang dari objek `Faction` (karena digantikan SSOT yang baru) masih terpanggil.

Telah diatasi dengan membuang testing yang sudah kadaluarsa (deprecated logic) tersebut. Tidak ada regresi logika domain, hanya pembersihan technical debt dari transisi penyimpanan JSON -> Table Fisik. 

## Usul teknis (kalau ada, sesuai batasan "Ruang Usul")
- Logika bobot (+5 dari +10) saat ini bersifat *hard-coded*. Di kemudian hari (Sprint 17/18), mungkin bobot ini bisa dinamis tergantung pada level kedudukan NPC di faksi tersebut (Menolong pimpinan guild bobotnya lebih besar ke faksi daripada menolong prajurit rendahan).

## Belum dikerjakan / diketahui belum sempurna
- Belum ada implementasi negatif (minus trust ke faksi) ketika player melukai/mengabaikan NPC, namun logika *EventBus* dan `applyInteraction()` sudah siap mengakomodir angka minus kapanpun dibutuhkan oleh ActionEngine/RuleEngine.
