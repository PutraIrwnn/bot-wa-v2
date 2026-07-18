# AETHERIA — Master Roadmap menuju v1.0 (Sprint 12B–20)

**Dibuat:** 18 Juli 2026
**Prinsip:** Roadmap ini FINAL untuk v1.0. Tidak boleh membengkak. Apapun ide baru selama eksekusi → masuk catatan v2.0 backlog, bukan disisipkan ke sprint berjalan.

---

## Peta besar

```
[STABILISASI]  →  [12B: Faction Engine]  →  [13-15: Social Depth]  →  [16-18: Player-Facing]  →  [19-20: Hardening & Soft Launch]
```

Setiap fase punya SATU pertanyaan yang harus terjawab "ya" sebelum lanjut fase berikutnya. Kalau jawabannya "nggak yakin" — itu tandanya belum boleh lanjut.

---

## Fase 0 — Stabilisasi (sebelum 12B, lihat AETHERIA_NEXT_STEPS_v1.0.md)
**Pertanyaan:** Apakah `npm test` hijau semua di fondasi (EventBus, World, NPC Agency, WhatsApp Flow)?
**Estimasi:** 3-7 hari kerja fokus (2 bug regresi + setup test-script).

---

## Sprint 12B — Faction Engine (lanjutan langsung dari 12A)
**Scope (sesuai `sprint_12_report.md` Known Limitations):**
- `FactionEngine.js` — implementasi nyata dari ADR-0021 (Faction as Domain Aggregate)
- Membership: NPC bisa join/leave faksi, disimpan sebagai relasi eksplisit
- Propagation Engine: reputasi faksi menyebar ke anggota secara asimetris (difilter oleh trait kepribadian tiap NPC — bukan semua anggota bereaksi sama ke reputasi faksinya)

**Pertanyaan sebelum lanjut ke Sprint 13:** Apakah faksi bisa naik-turun reputasi dari kejadian dunia, dan itu kelihatan beda-beda efeknya ke tiap anggota faksi (bukan cuma 1 angka global)?

**Estimasi:** 1-2 minggu, tergantung jam kerja tersedia.

---

## Sprint 13-15 — Social Depth (Phase 4 lanjutan)
Ini area yang paling berisiko complexity meledak — perlu dijaga ketat scope-nya.

- **Sprint 13 — Faction Conflict & Diplomacy:** relasi ANTAR faksi (rival/ally), dipicu event dunia (kompetisi sumber daya, dst), bukan di-set manual.
- **Sprint 14 — Player Reputation di mata Faksi:** player punya standing terpisah per-faksi, dihitung dari histori interaksi (sama seperti NPC-to-NPC, tapi player-to-faction).
- **Sprint 15 — Rumor-Faction Integration:** gosip yang nyebar lewat Contact Graph sekarang bisa soal faksi (bukan cuma individu), dan tingkat percaya NPC ke gosip itu dipengaruhi affiliasi faksi mereka sendiri.

**Pertanyaan sebelum lanjut ke Sprint 16:** Kalau kamu mainin skenario "faksi A nyebar fitnah soal faksi B", apakah hasilnya masuk akal tanpa harus di-debug manual satu-satu?

---

## Sprint 16-18 — Player-Facing Layer
Sampai titik ini, semuanya backend simulation. Fase ini yang bikin ini kerasa jadi GAME, bukan cuma engine yang jalan sendiri.

- **Sprint 16 — Player Command Surface:** command WhatsApp yang lengkap buat player berinteraksi dengan sistem sosial (cek reputasi, cek relasi, cek gosip yang beredar tentang mereka).
- **Sprint 17 — Narrative Polish:** PromptEngine dan NarrationSanitizer dituning supaya output Gemini konsisten kualitasnya, nggak cuma "jalan" tapi enak dibaca.
- **Sprint 18 — Onboarding Flow:** player baru masuk dunia yang sudah "hidup" — perlu cara natural buat mereka ngerti sistem tanpa dijejali tutorial panjang.

**Pertanyaan sebelum lanjut ke Sprint 19:** Kalau orang di luar kamu (temen, bukan yang ngerti internal-nya) coba pakai bot ini 15 menit, apakah mereka ngerti apa yang terjadi tanpa kamu jelasin?

---

## Sprint 19-20 — Hardening & Soft Launch
- **Sprint 19 — Load & Edge Case:** apa yang terjadi kalau banyak player sekaligus, NPC dalam jumlah besar, dunia jalan lama tanpa restart. Termasuk cek ulang risiko ban WhatsApp/baileys (lihat catatan risiko di bawah).
- **Sprint 20 — Soft Launch Terbatas:** rilis ke grup kecil (kamu + beberapa teman), bukan publik luas. Ini "v1.0 selesai" versi realistis — bukan sempurna, tapi bisa dipakai dan diobservasi orang lain.

**Setelah Sprint 20:** apapun ide baru (multi-server, faksi player-created, ekonomi, dst.) → v2.0 backlog. Titik ini keputusan final, jangan direvisi di tengah jalan tanpa alasan kuat.

---

## Catatan risiko yang perlu dipantau sepanjang roadmap

1. **WhatsApp/baileys ToS risk** — baileys adalah unofficial client, akun bisa kena banned. Sebelum Sprint 20 (soft launch), pertimbangkan nomor WhatsApp terpisah/dedicated buat testing, bukan nomor pribadi utama.
2. **Test suite harus tetap dijalankan FULL setiap sprint**, bukan cuma test punya sprint itu (lihat AETHERIA_NEXT_STEPS_v1.0.md bagian 2). Ini pencegah #1 supaya kejadian regresi tersembunyi kayak kemarin nggak terulang.
3. **Complexity Belief/Trust/Faction itu compounding** — kalau di Sprint 13-15 kerasa mulai susah di-reasoning manual, itu sinyal buat berhenti nambah dimensi baru dan konsolidasi dulu, bukan tanda untuk didorong terus.

---

## Estimasi total kasar

Fase 0 s.d. Sprint 20, dikerjakan solo/kecil dengan bantuan AI eksekusi: **~3-5 bulan** kalau konsisten beberapa jam per minggu, bisa lebih cepat kalau intensif. Ini bukan janji presisi — cuma supaya kamu punya ekspektasi kasar, bukan target tanpa akhir yang bikin capek kayak kemarin.
