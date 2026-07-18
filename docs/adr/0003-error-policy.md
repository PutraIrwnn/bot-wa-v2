# ADR 0003: Error Handling Policy (Level 1 vs Level 2)

## 1. Masalah apa yang diselesaikan?
Dalam sistem *asynchronous fire-and-forget* (seperti EventBus), saat *subscriber* gagal menjalankan fungsinya (contoh: *database timeout* saat menyimpan state NPC), sistem perlu tahu ke mana *error* harus bermuara. Tanpa kebijakan ini, *error* hanya akan ditelan (*swallowed*) atau dicetak acak ke `console.error`, sehingga sistem tidak bisa bereaksi secara elegan ketika terjadi bencana infrastruktur.

## 2. Alternatif apa yang dipertimbangkan?
- **Menerbitkan Domain Event (`system.dbFailed`) untuk semua kegagalan:** Terlalu bising (*noisy*). Kegagalan operasional (*connection timeout*, *deadlock*) yang mungkin berhasil dengan mekanisme *retry* tidak patut menjadi konsumsi *Domain Logic* (karena bukan fakta gameplay).
- **Silent Fail:** Menangkap error di dalam EventBus dan membiarkannya mati (Sangat buruk untuk *maintenance* dan observabilitas).

## 3. Kenapa solusi ini dipilih?
Kami membedakan error menjadi dua level secara hierarkis:
- **Level 1: Operational Error:** Kesalahan infrastruktur (MySQL mati, Network Putus). Hal ini ditangani murni oleh **Logger Module**. Logger akan mencatat ke file/monitoring, namun sistem (EventBus/NPCEngine) tidak akan menyebarkan event ini sebagai fakta gameplay.
- **Level 2: System State Changed:** Jika Level 1 Operational Error berakibat pada berubahnya perilaku sistem (misalnya *bot* terpaksa mematikan *persistence* dan berpindah ke *Offline/Read-Only Mode*), barulah sebuah *Domain Event* dieksekusi. Nama eventnya murni deskriptif terhadap kondisi sistem (misal: `system.persistenceUnavailable`), bukan deskriptif terhadap teknologinya (bukan `system.mysqlFailed`).

## 4. Bagaimana kita membuktikan bahwa solusi ini benar?
Dibuktikan melalui pembuatan `Logger.js` (sebagai pelabuhan akhir Level 1). Dan pembuktian *Recovery Test* di Sprint 3, di mana mematikan koneksi MySQL tidak membuat *bot WhatsApp crash*, melainkan hanya mengaktifkan *logging*.
