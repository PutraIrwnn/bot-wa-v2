# ADR 0005: Scalable Recovery Strategy (Masa Depan)

## 1. Masalah apa yang diselesaikan?
Saat ini, proses *Recovery* pada saat bot *restart* menggunakan strategi "Load All" (membaca semua NPC dan memuatnya langsung ke RAM *NPCEngine*). Secara operasional hal ini sangat aman untuk populasi dunia yang kecil (Phase 1). Namun, saat jumlah entitas (NPC, Rumor, Player) membengkak menjadi ribuan, pendekatan ini berpotensi membahayakan kapasitas RAM Node.js dan memperlambat waktu *startup* (*Boot Time*).

## 2. Alternatif apa yang dipertimbangkan?
- **Lazy Loading (On-Demand):** NPC hanya ditarik dari *database* ke RAM ketika mereka pertama kali diajak bicara oleh pemain, atau saat *world event* mengharuskan mereka bereaksi.
- **Partial Recovery (Region-based):** Hanya memuat entitas pada *region* atau kota yang sedang aktif (memiliki minimal 1 pemain di dalamnya).
- **Snapshot / Redis Cache:** Memuat *state* dunia secara periodik ke penampungan memori L2 (*Redis*), bukan langsung menabrak MySQL pada saat inisialisasi.

## 3. Keputusan
Untuk saat ini (Sprint 4), kami **tetap mempertahankan Load All** demi kemudahan implementasi dan determinasi *state*.
**NAMUN**, ADR ini secara sadar mencatat bahwa pendekatan "Load All" adalah **hutang teknis terkendali (Controlled Technical Debt)**. Ketika populasi entitas melampaui ambang batas tertentu (misal: > 500 NPC aktif), sistem harus beralih ke **Lazy Loading** atau **Region-based Recovery**. Arsitektur *Repository Pattern* saat ini sudah siap memfasilitasi transisi tersebut tanpa perlu membongkar domain logika.
