# Sprint 0a Report (Stabilisasi - NPC Agency)

## Scope yang dikerjakan
- Memperbaiki regresi pada tes integrasi `NPCAgency.test.js`.
- Memperbaiki cara testing untuk simulasi agency (`BehaviorEngine.js`) yang sekarang sudah menggunakan pendekatan deterministik (hash kriptografi) bukan lagi `Math.random()`.

## File yang diubah/ditambah
- `tests/integration/NPCAgency.test.js`
  ```javascript
  // Override crypto.createHash untuk test kepastian pergerakan secara deterministik
  const crypto = require('crypto');
  const originalCreateHash = crypto.createHash;
  crypto.createHash = () => ({
      update: () => ({
          digest: () => '0000000000000000000000000000000000000000000000000000000000000000'
      })
  });
  ```

## Hasil test SEBELUM mulai (baseline)
```
[NPCEngine] Loaded 1 NPCs from repository.
▶ NPC Agency: NPC Decides to Move autonomously on WorldTick
  ✖ 1. WorldTick memicu NPC Agency (45.3533ms)
✖ NPC Agency: NPC Decides to Move autonomously on WorldTick (50.7482ms)
ℹ tests 2
ℹ suites 0
ℹ pass 0
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 328.4887

✖ failing tests:

test at tests\integration\NPCAgency.test.js:29:13
✖ 1. WorldTick memicu NPC Agency (45.3533ms)
  AssertionError [ERR_ASSERTION]: Event npc.decidedToMove tidak ditembakkan
```

## Hasil test SETELAH selesai (WAJIB tempel output asli)
```
[NPCEngine] Loaded 1 NPCs from repository.
▶ NPC Agency: NPC Decides to Move autonomously on WorldTick
  ✔ 1. WorldTick memicu NPC Agency (29.0382ms)
✔ NPC Agency: NPC Decides to Move autonomously on WorldTick (41.2686ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 226.8937
```

## Regresi terdeteksi (kalau ada)
Tidak ada. Regresi yang ada (tes yang fail sebelumnya) justru telah diperbaiki dengan penyesuaian _mocking_ pada `crypto.createHash` (bukan lagi `Math.random()`) di file test tersebut.

## Usul teknis (kalau ada, sesuai batasan "Ruang Usul")
(Tidak ada)

## Belum dikerjakan / diketahui belum sempurna
Saat ini baru menyelesaikan perbaikan 1 test yang fail (`NPCAgency.test.js`). Masih ada regresi di WhatsApp Flow (`WhatsAppFlow.test.js`) dan perlu memverifikasi Persistence Database MySQL (`Persistence.test.js`) sesuai dengan instruksi yang tertera di `AETHERIA_NEXT_STEPS_v1.0.md`.
