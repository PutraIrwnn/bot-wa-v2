# ADR 0004: Repository Pattern dan Keterlibatan Engine

## 1. Masalah apa yang diselesaikan?
Kami perlu menyimpan state NPC dan Dunia ke dalam Database (MySQL). Jika kami menaruh query SQL (seperti `INSERT INTO npc...`) langsung di dalam `NPCEngine.js`, *engine logic* murni milik domain (gameplay) akan tercemar oleh detail teknis penyimpanan. Hal ini menyulitkan *testing* dan mengunci arsitektur kita ke satu jenis database secara *hard-coded*.

## 2. Alternatif apa yang dipertimbangkan?
- **Persistence Event Listener (Murni Loose-Coupling):** NPCEngine mempublish `player.helpedNpc`. Kemudian `PersistenceListener` menerimanya, lalu mencari tahu *state* baru NPC dan menyimpannya ke MySQL. Keterpisahan (decoupling) sangat sempurna, namun hal ini meningkatkan kompleksitas kode terlalu tinggi pada tahap awal (Sprint 3), karena Listener harus menduplikasi pembacaan *state*.
- **Active Record Pattern:** Menyatukan logika bisnis dan penyimpanan di dalam objek NPC. Buruk untuk arsitektur *Event-Driven* yang menggunakan *Service/Engine classes*.

## 3. Kenapa solusi ini dipilih?
Solusi kompromi yang dipilih adalah **Repository Pattern dipanggil langsung dari Engine via Dependency Injection**.
- Kami mendefinisikan *interface* abstrak (misal: `INpcRepository.js`, `IUnitOfWork.js`).
- `NPCEngine` hanya tahu tentang *interface* ini, dan dia langsung memanggil `npcRepository.saveState(npc)` setelah merubah RAM.
- **Kompromi (Trade-off):** Engine masih tahu bahwa konsep *persistence* itu ada (walau dia tidak tahu jenis databasenya). Di masa depan, jika sistem membesar, arsitektur *Persistence Listener* dapat diadopsi dengan mudah dengan cara mencabut pemanggilan *repository* dari *Engine*.
- Pola *Unit of Work* disiapkan sebagai janji desain (design promise) agar kelak pembaruan NPC dan World State dapat dilakukan dalam satu transaksi atomik.

## 4. Bagaimana kita membuktikan bahwa solusi ini benar?
Dibuktikan melalui kebebasan unit test (`NPCEngine.test.js`) menggunakan **InMemoryNpcRepository** (mock), sedangkan di `test_world.js` menggunakan **MySqlNpcRepository**. Keduanya berjalan tanpa perlu mengubah isi file `NPCEngine.js` sebaris pun.
