# AETHERIA — Immediate Next Steps (v1.0)

**Dibuat:** 18 Juli 2026
**Konteks:** Ditulis setelah verifikasi langsung terhadap repo `bot-wa-v2` (bukan dari laporan/dokumentasi saja). Dokumen ini adalah SUMBER KEBENARAN untuk urutan kerja saat ini. Kalau ada instruksi lain yang bertentangan (dari chat lama, dari Gemini, dari ChatGPT), dokumen ini yang menang sampai direvisi ulang secara sadar.

---

## 0. Kenapa dokumen ini ada

Proses lama (Antigravity/Gemini eksekusi → ChatGPT review dokumentasi hasil) punya blind spot: reviewer tidak pernah melihat kode/test benar-benar berjalan, hanya laporan naratif tentang kode. Ini menyebabkan regresi di komponen fondasi (Sprint 4-6) tidak terdeteksi selama 6+ sprint.

**Bukti konkret (dijalankan 18 Juli 2026, `node --test` di seluruh `tests/unit` + `tests/integration`):**
- 41 dari 50 test PASS (82%)
- 9 FAIL, tersebar di 3 file:
  - `NPCAgency.test.js` — NPC tidak bergerak otonom saat `world.tick` (event `npc.decidedToMove` tidak pernah ditembakkan)
  - `WhatsAppFlow.test.js` — flow `!help` crash (`TypeError: Cannot read properties of undefined (reading 'trust')`), dan `ActionEngine` tidak menghasilkan pesan balasan yang diharapkan
  - `Persistence.test.js` — gagal karena butuh koneksi MySQL aktif (kemungkinan besar ini valid gagal karena environment test, bukan bug logic — perlu dicek dengan DB nyala)
- Sprint 12A sendiri: klaim "100% pass" di `sprint_12_report.md` **akurat** untuk scope-nya (Policy Pipeline, RelationshipLifecycle, EvidenceStrength — dikonfirmasi PASS individual).

Kesimpulan: fondasi arsitektur (Hexagonal, EventBus, ADR discipline) itu nyata dan solid. Masalahnya bukan "semua halu", masalahnya proses verifikasi yang bolong.

---

## 1. Urutan kerja — JANGAN diloncat

### Langkah 1: Fix regresi NPC Agency
- File: `src/engine/npc/NPCEngine.js`, `src/engine/npc/BehaviorEngine.js`, kaitannya ke `WorldEngine` tick emitter.
- Target: `node --test tests/integration/NPCAgency.test.js` PASS.
- Definisi selesai: test hijau, DAN dicoba manual — trigger 1 `world.tick`, NPC pindah posisi/state sesuai `BehaviorEngine`.

### Langkah 2: Fix regresi WhatsApp Flow (`!help`)
- File: `src/adapter/router/CommandRouter.js`, `src/engine/core/ActionEngine.js`, `src/adapter/whatsapp/MessageAdapter.js`.
- Ini menyentuh langsung locked decision #1 kalian (Ports & Adapters, ADR-0008/0009) — prioritas tinggi karena kalau boundary ini bocor/rusak, semua command lain berisiko ikut rusak diam-diam.
- Target: `node --test tests/integration/WhatsAppFlow.test.js` PASS.
- Definisi selesai: test hijau, DAN dicoba manual — kirim `!help` beneran dari WhatsApp (atau simulasi socket), balesan sesuai ekspektasi.

### Langkah 3: Cek `Persistence.test.js` dengan MySQL nyala
- Kalau masih fail dengan DB aktif → itu bug beneran, masuk antrian fix.
- Kalau pass dengan DB aktif → tandai di catatan bahwa test ini butuh DB running, bukan bug.

### Langkah 4: Baru setelah Langkah 1-3 hijau semua — mulai Sprint 12B (Faction Engine)
- Jangan mulai Faction Engine di atas NPC Agency yang belum fix. Kalau nanti Faction Engine kelihatan "bug", kamu nggak akan tahu itu bug baru atau imbas bug lama yang belum kefix.

---

## 2. Aturan baru yang wajib dipakai mulai sekarang

1. **Sebelum bilang satu sprint/task "selesai", jalankan:**
   ```
   node --test tests/unit/ tests/integration/
   ```
   (pastikan `npm install` sudah dijalankan duluan). Kalau ada yang fail, itu BUKAN selesai — perbaiki dulu atau catat sebagai known issue eksplisit dengan alasan (contoh: butuh DB aktif).

2. **Ganti `package.json` script test** (sekarang isinya cuma placeholder error):
   ```json
   "scripts": {
     "test": "node --test tests/unit/ tests/integration/"
   }
   ```
   Setelah ini, `npm test` akan benar-benar menjalankan seluruh suite, bukan langsung error.

3. **Laporan sprint wajib mencantumkan hasil run FULL suite**, bukan cuma test milik sprint itu sendiri. Format sederhana: total pass/fail dari `npm test`, plus daftar file yang fail kalau ada.

4. **Definisi "selesai" untuk task apapun ke depan:**
   - Kode ada di path yang disebut
   - `npm test` hijau semua (atau fail-nya didokumentasikan dengan alasan valid)
   - Minimal 1 skenario dicoba manual/nyata, bukan cuma lewat test otomatis

---

## 3. Yang TIDAK perlu dikerjakan dulu

- Jangan lanjut nulis dokumen konstitusi/bible tambahan (Project Constitution, Handbook, dst.) sampai Langkah 1-4 di atas selesai. Dokumen-dokumen itu sudah ada draftnya (`document/`), itu cukup untuk sekarang — nambah lagi sebelum fondasi stabil cuma nambah beban tanpa nambah kejelasan.
- Jangan mulai fitur v2.0 apapun (sudah di luar scope Sprint 20).
