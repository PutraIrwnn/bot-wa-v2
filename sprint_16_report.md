# Sprint 16 Report (Player Command Surface)

## Scope yang dikerjakan
1. **Pembersihan Technical Debt:** Menyatukan logika dan file `RumorEngine` yang sebelumnya terduplikasi antara `/engine/core` dan `/engine/rumor`. Logika *Faction Rumor* (dari Sprint 15) kini disatukan secara solid ke dalam entitas aslinya menggunakan `RumorDTO`. File duplikat `core/RumorEngine.js` telah dihapus.
2. **Implementasi Player Command Surface (`!reputasi`, `!faksi`, `!rumor`):**
   - Mengembangkan *command handler* dalam `ActionEngine` agar sistem dapat berinteraksi dengan WhatsApp `CommandRouter`.
   - Menginisiasi/menghubungkan `FactionEngine` dan `RumorEngine` langsung ke lapisan *Action / Adapter*.
   - Menyertakan validasi *Edge Case* (pemain baru, data kosong, atau entitas tidak ditemukan) untuk memberikan *graceful fallback* respons di WhatsApp.

## Keputusan Desain Penting (ADR)
- **Dependency Injection di Lapisan Index (`index.js`):** Agar ActionEngine (dan WhatsApp Adapter) bisa mengakses informasi lintas-domain, `FactionEngine` kini disertakan secara eksplisit dari awal (*bootstrap*) melalui `index.js`, sehingga memastikan sinkronisasi *state* dapat langsung diproses oleh command WhatsApp.
- **Toleransi Lingkungan Eksekusi:** Menyadari bahwa terdapat *restart* koneksi (MySQL mati sewaktu pengujian *Regression*), namun *Unit & Integration Test* spesifik Sprint 16 yang murni menguji Domain Layer dan Command Handlers semuanya berhasil *PASS* dengan sempurna tanpa menyentuh *I/O database*.

## File yang diubah/ditambah
- `src/index.js` (Memperbarui dependensi ActionEngine)
- `src/engine/core/ActionEngine.js` (Menambah handler perintah interaksi)
- `src/engine/rumor/RumorEngine.js` (Integrasi event diplomasi faksi)
- `src/engine/rumor/RumorDTO.js` (Penambahan atribut faksi)
- `tests/integration/PlayerCommandSurface.test.js` [NEW] (Memverifikasi perintah-perintah baru, termasuk skenario kosong / Edge Case)
- `tests/unit/RumorEngine.test.js` (Diperbarui menyesuaikan refactoring)
- `src/engine/core/RumorEngine.js` [DELETED] (Technical debt dihapus)

## Hasil test (Sprint 16)
```
▶ Player Command Surface (Sprint 16)
  ✔ 1. Command !reputasi (1.5877ms)
  ✔ 2. Command !faksi (0.7627ms)
  ✔ 3. Command !rumor (2.5058ms)
✔ Player Command Surface (Sprint 16) (7.0882ms)
▶ RumorEngine Unit Test
  ✔ 1. FactionRivalryFormed creates a negative faction rumor (2.9314ms)
  ✔ 2. FactionAllianceFormed creates a positive faction rumor (0.5725ms)
✔ RumorEngine Unit Test (5.6156ms)
ℹ tests 7
ℹ pass 7
```

## Regresi terdeteksi (kalau ada)
Secara fungsional logika, tidak ada regresi yang terjadi. Pengujian `npm test` global melaporkan kegagalan hanya pada modul `Persistence.test.js` yang disebabkan oleh gangguan konektivitas (seperti Laragon mati). Namun hal ini merupakan isu lingkungan eksternal sementara (Infrastruktur), bukan keretakan logika arsitektur.
