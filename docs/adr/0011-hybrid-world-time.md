# ADR 0011: Hybrid World Time (Time as a Domain Concept)

## 1. Masalah apa yang diselesaikan?
Dunia *Aetheria* membutuhkan "Waktu" untuk menggerakkan jadwal NPC, merubah cuaca, dan membunuh rumor basi.
- Jika waktu ditenagai murni oleh **Cron Job (setInterval)**, server akan membakar sumber daya untuk mensimulasikan dunia meskipun pemain nol (0) dan offline, mengorbankan filosofi *Story First*.
- Jika waktu dihitung murni secara **Turn-based (Per Aksi Pemain)**, maka "Waktu" tidak lagi seragam dan dunia berputar mengekor interaksi pemain (pemain hiatus = waktu NPC diam).

## 2. Keputusan
Mengadopsi pola **Hybrid World Time**, dengan aturan mutlak: **Time is a domain concept, not an infrastructure concern.**
Infrastruktur Node (`setInterval`) tidak dikenali oleh domain. Domain (*Engine*) murni hanya memahami `EventBus.publish('world.tick')`.

*Engine Waktu* (`WorldEngine`) akan memproduksi kepingan waktu (*Tick*) dengan dua pilar simulasi:
1. **Passive Tick (Catch-Up):** Dijalankan sesaat sebelum aktivitas berat / saat inisiasi. Jika *Aetheria* mati 6 jam dan baru dihidupkan, `WorldEngine` membandingkan waktu sekarang dengan `LastWorldUpdate` dari Database, lalu seketika menembakkan sejumlah X `world.tick` secara instan agar jadwal NPC "mengejar" keterlambatannya (Tanpa mengorbankan siklus komputasi saat server redup).
2. **Active Tick:** Mekanisme interval standar (Misal: 10 menit sekali melempar `world.tick`) yang direstui berjalan **HANYA** ketika ada tanda-tanda keaktifan dunia (server online / pemain bermain).

Pendekatan ini menyelaraskan determinisme *real-time* dengan konservasi sumber daya.
