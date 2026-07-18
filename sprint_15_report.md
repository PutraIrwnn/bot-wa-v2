# Sprint 15 Report (Rumor-Faction Integration)

## Scope yang dikerjakan
- Penambahan kapabilitas **Rumor Faksi** pada `RumorEngine`. Kini event diplomasi dunia (`FactionRivalryFormed` dan `FactionAllianceFormed`) akan secara otomatis memicu terciptanya entitas Rumor baru yang memiliki afinitas spesifik ke sebuah faksi.
- Penambahan mekanisme **Ingroup Bias (Affiliation Bias)** pada layer kognisi NPC di `BeliefEngine`. Saat NPC mengevaluasi rumor terkait faksi mereka sendiri, NPC akan menunjukkan pembelaan:
  - *Denial* (pengurangan skor Belief hingga 30 poin) apabila mendengar rumor negatif mengenai faksinya sendiri.
  - *Bangga / Ingroup Favoritism* (peningkatan skor Belief 20 poin) apabila mendengar rumor positif mengenai faksinya sendiri.

## Keputusan Desain Penting (ADR)
- Sesuai dengan hasil diskusi, **Cross-Faction Bias tidak diimplementasikan** pada sprint ini untuk mencegah *complexity compounding* di layer Belief. BeliefEngine tetap dibiarkan *decoupled* dari data jaringan diplomasi (FactionEngine) demi menjaga skalabilitas dan pemisahan tanggung jawab (*Separation of Concerns*). 

## File yang diubah/ditambah
- `src/engine/core/RumorEngine.js` (Modifikasi pendengar event diplomasi)
- `src/engine/npc/BeliefEngine.js` (Implementasi rumus *Affiliation Bias*)
- `tests/unit/RumorEngine.test.js` [NEW] (Memverifikasi pembuatan Faction Rumor)
- `tests/integration/BeliefCognition.test.js` (Memverifikasi skor bias deterministik)

**Cuplikan Logika (BeliefEngine.js):**
```javascript
// Sprint 15: Ingroup Bias (Affiliation Bias)
if (globalRumor.targetFactionId && npc.faction_id === globalRumor.targetFactionId) {
    if (globalRumor.affinity === 'negative') {
        affiliationBias = -30; // Denial
        biasReason = ' (Denial: Menolak percaya hal buruk tentang faksinya sendiri)';
    } else if (globalRumor.affinity === 'positive') {
        affiliationBias = 20; // Ingroup favoritism
        biasReason = ' (Bangga: Sangat percaya hal baik tentang faksinya sendiri)';
    }
}
```

## Hasil test SEBELUM mulai (baseline)
```
ℹ tests 68
ℹ suites 0
ℹ pass 68
ℹ fail 0
```

## Hasil test SETELAH selesai (Output Asli)
```
  ✔ Belief is calculated deterministically based on Trust (2.6398ms)
  ✔ Ingroup Bias: NPC bereaksi bias terhadap rumor tentang faksinya sendiri (0.8617ms)
✔ Belief Cognition: Knowing does not mean Believing (ADR-0018) (6.8636ms)

[RumorEngine] Rumor Faksi Lahir: Kudengar faksi F_THIEVES mulai bermusuhan karena perebutan wilayah.
[RumorEngine] Rumor Faksi Lahir: Kudengar faksi F_MERCHANT menjalin aliansi baru.
▶ RumorEngine Unit Test
  ✔ 1. FactionRivalryFormed creates a negative faction rumor (2.3922ms)
  ✔ 2. FactionAllianceFormed creates a positive faction rumor (0.4517ms)
✔ RumorEngine Unit Test (4.7814ms)
ℹ tests 72
ℹ suites 0
ℹ pass 72
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6237.3161
```

## Regresi terdeteksi (kalau ada)
Tidak ada regresi sama sekali. Sistem Belief yang lama tetap mengevaluasi perhitungan tanpa bias secara normal. Test suite yang baru berjalan secara independen dan bersih.
