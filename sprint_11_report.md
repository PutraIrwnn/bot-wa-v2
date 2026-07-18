# Aetheria - Sprint 11 Report: Relationship Layer & Engine Hardening

**Date:** 17 Juli 2026
**Status:** ✅ Selesai (Completed)

## 📌 Ringkasan Eksekutif
Sprint 11 telah berhasil diselesaikan dengan fokus utama pada pembenahan *tech debt* terkait stabilitas engine dan perancangan *Relationship System* yang kuat secara arsitektural. Sesuai dengan hasil *Design Review*, Relationship kini dirancang bukan sebagai metrik linear, melainkan sebagai kalkulasi *Derived State* berdasarkan dimensi sosial dan rekam jejak histori (Accumulated History).

## 🚀 Pencapaian Utama

### 1. Perombakan Konsep "Relationship" (ADR-0020)
- **Multidimensional Relationships:** Pemisahan antara *Dimensions* (Trust, Respect, Fear, Affinity) sebagai input state, dengan *Social Labels* (Rival, Enemy, Nemesis, dll.) sebagai status turunan (*derived state*).
- **Immutable History:** Hubungan sosial kini sepenuhnya berlandaskan filosofi *"Relationships are accumulated history"*. Sistem mencatat *history log* secara permanen tanpa opsi edit/hapus. AI Narator kini memiliki konteks penyebab yang solid (mengapa NPC membenci atau mempercayai karakter tertentu).
- **Relationship Policy Engine:** Proses abstraksi label sosial dipisahkan dalam `RelationshipPolicy` menggunakan metode kalkulasi yang cermat, mencegah ketergantungan *if/else* yang kaku di dalam sistem pusat.

### 2. Fundamental Event Handling
- `RelationshipEngine` tidak lagi sebatas memantau fluktuasi skor trust tunggal. Engine kini merespons *fundamental domain events* secara langsung (seperti `life.saved`, `promise.broken`, `betrayal.detected`) untuk menghasilkan respons relasi yang jauh lebih relevan secara naratif.

### 3. Engine Hardening & Determinism
- **Behavior Engine Determinism:** Mengeliminasi penggunaan `Math.random()` pada logika *agency* NPC. Pengambilan keputusan kini didasari oleh generator *pseudo-random* yang deterministik (`hash(worldTick, npcId, location)`), sehingga status perilaku dunia menjadi stabil dan 100% *reproducible*.
- **Event-Driven Consequence:** Menghilangkan kelemahan arsitektural pada `ConsequenceEngine` yang sebelumnya cenderung menyerupai *polling*. Kini, evaluasi prediksi dan konsekuensi dipicu sepenuhnya melalui aliran event (`story.resolved` ➔ Evaluasi ➔ `world.predictionCorrect / Wrong`).

## 🧪 Hasil Verifikasi & Integrasi
Seluruh rangkaian integrasi sistem di-cover oleh suite pengujian otomatis, dengan rasio kelulusan 100%.

| Test Case | Deskripsi | Status |
|---|---|:---:|
| `BehaviorDeterminism` | Membuktikan NPC akan mengambil keputusan yang identik jika diputar ulang pada waktu (*tick*) yang sama (tanpa side effects `Math.random()`). | ✅ PASS |
| `ConsequenceEventFlow` | Event mengalir dan tervalidasi murni secara *event-driven* tanpa *polling* loop. | ✅ PASS |
| `MultidimensionalRelationship` | Evaluasi di mana subjek memiliki *Trust* tinggi sekaligus *Low Affinity* terbukti menghasilkan label relasi negatif ("Nemesis", mirip skenario Batman-Joker), mengonfirmasi Trust ≠ Kedekatan. | ✅ PASS |
| `RelationshipReplay` | Membuktikan konsistensi *derived state*, di mana status *Social Label* dapat direkonstruksi 100% sama dari *history log* dan *dimensions*. | ✅ PASS |

## ⚠️ Known Limitations & Trade-offs
Demi menjaga scope dan stabilitas rilis Sprint 11, ada beberapa fungsionalitas yang sengaja **belum diimplementasikan** (Non-Goals):
1. **Belum Ada Relationship Lifecycle**: Hubungan belum mengenal fase siklus hidup seperti *Dormant*, *Decaying*, atau *Archived* meskipun entitas tersebut terpisah ruang dan waktu lama.
2. **Tidak Ada Label Conflict Resolver**: Saat ini semua label memungkinkan hidup bersamaan tanpa sistem *Resolver* khusus (misal: Trusted Ally sekaligus Enemy), meskipun kebijakan kalkulasi berupaya menghindarinya.
3. **Bobot Evidence Belum Dibedakan**: Semua rekam jejak historis belum memiliki tingkatan *Evidence Strength* (seperti *Low* untuk rumor vs *Absolute* untuk kesaksian langsung).
4. **Hanya Hubungan Individu (1-to-1)**: Sistem saat ini belum mensupport Group Relationship, Faction Dynamics, maupun pewarisan hubungan (*inheritance*).
5. **Relationship Persistence Compression**: Histori log berpotensi membengkak, dan belum ada optimasi/kompresi saat menyimpan state ini ke dalam persistence layer jangka panjang.

## 🔗 Referensi Repositori
- **ADR-0020:** `docs/adr/0020-relationship-as-derived-state.md`
- **Domain Entities:** `src/engine/npc/Relationship.js`, `src/engine/npc/RelationshipPolicy.js`, `src/engine/npc/RelationshipEngine.js`
- **Core Engine Updates:** `src/engine/npc/BehaviorEngine.js`, `src/engine/world/ConsequenceEngine.js`, `src/engine/core/DomainEvents.js`
