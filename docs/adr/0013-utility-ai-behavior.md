# ADR 0013: Utility AI (Deterministic Scoring)

## 1. Masalah apa yang diselesaikan?
BehaviorEngine saat ini bergantung pada alur statis atau *if-else* dasar (misal: Jika jam 12, maka tidur). Seiring pertambahan dimensi dunia (cuaca berubah, NPC kelaparan, ketakutan karena rumor), sistem *if-else* akan hancur oleh kompleksitas (Spaghetti Code). Pendekatan "AI" seringkali disalahartikan sebagai integrasi Machine Learning/LLM untuk mengambil keputusan, padahal kita mengedepankan filosofi determinisme (*Rule Engine*).

## 2. Keputusan
Mengadopsi pola perancangan **Utility AI** di masa depan untuk mendikte *BehaviorEngine*.
Nama **Utility AI** BUKAN merujuk pada integrasi *Machine Learning (Generative AI)*, melainkan perhitungan kalkulus/matematis untuk setiap 'Kebutuhan' (*Need*):
- Setiap tindakan potensial (*Goal*) dihitung nilai Utilinya (skor matematis) berbasis pada *State* (Misal: `Skor Pulang = Bobot Malam + Bobot Hujan - Bobot Lapar`).
- Goal dengan total skor tertinggi otomatis dieksekusi.

**Sistem Tetap Deterministik:** Tidak ada intervensi *Random()*. Masukan *State* yang sama (Hujan, Jam 22:00, NPC Lapar) akan menghasilkan bobot dan keputusan *Utility* yang sama persis dan bisa diuji secara TDD (Test-Driven Development).
