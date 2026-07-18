# Aetheria - Sprint 12A Report: Social Systems Foundation

**Date:** 17 Juli 2026
**Status:** ✅ Selesai (Completed - Phase A)

## 📌 Ringkasan Eksekutif
Berdasarkan masukan *Reviewer* (Sprint 11 Acceptance), eksekusi Sprint 12 diputuskan untuk dipecah menjadi dua tahap demi menjaga kualitas arsitektur (*Separation of Concerns*) dan memudahkan *debugging* mengingat skalanya yang sangat masif. 

Sprint 12A ini telah berhasil mengimplementasikan tulang punggung sistem sosial Aetheria, yang meliputi siklus hidup relasi, pembobotan kualitas *evidence*, dan mekanisme resolusi konflik hierarki label relasi.

## 🚀 Pencapaian Utama (Sprint 12A)

### 1. Keputusan Desain Terkunci (ADR-0021 & ADR-0022)
- **ADR-0021 (Faction as Domain Aggregate):** Mengunci keputusan bahwa Faksi bukanlah sekadar entitas *Tag*, bukan pula *Super-NPC*. Faksi resmi didesain sebagai *Domain Aggregate* yang berdiri terpisah dan mengelola reputasi serta *shared knowledge*.
- **ADR-0022 (Active Relationship Decay):** Menetapkan bahwa *decay* pada relasi bukan merupakan fungsi kalkulasi pasif/malas (lazy evaluation) saat data dibaca, melainkan secara deterministik dipicu oleh event `world.dayPassed` dari *World Engine*.

### 2. Evidence Strength (Value Object)
Konsep skor mati untuk pembuktian telah diganti dengan *Value Object* mandiri (`EvidenceStrength.js`).
Tingkatan bukti (`RUMOR`, `WITNESS`, `VERIFIED`, `FIRST_PERSON`) kini memiliki metrik cerdas independen untuk mengatur `weight()`, `decayRate()`, dan `shareProbability()`. Ini memberikan kemampuan dinamis bagi NPC dalam menilai validitas informasi.

### 3. Active Relationship Lifecycle
Diimplementasikannya `RelationshipLifecycleService` yang sepenuhnya *event-driven*.
Setiap pergantian hari, layanan ini memonitor interaksi. Jika NPC dan Player tidak berinteraksi selama **30 hari**, relasi akan memasuki status `DORMANT` dan secara matematis diluruhkan. Memasuki **100 hari**, relasi turun status menjadi `ARCHIVED`. Hubungan sosial tak lagi statis seumur hidup.

### 4. Policy Pipeline & Conflict Resolver
Sistem `RelationshipPolicy` telah direfaktor dari rantai *if-else* kaku menjadi sebuah arsitektur *Policy Pipeline*:
- `RelationshipEvaluator` (Ekstraksi dimensi relasi)
- `ConflictResolver` (Mencegah anomali seperti pelabelan ganda "Nemesis" & "Trusted Ally")
- `PriorityResolver` (Memfilter label lemah ketika label absolut dominan hadir)
- `RelationshipClassifier` (Finalisasi bentuk label sosial)

## 🧪 Hasil Verifikasi & Integrasi
Seluruh rangkaian integrasi di Fase 12A ini telah divalidasi dengan rasio kelulusan 100%.

| Test Case | Deskripsi | Status |
|---|---|:---:|
| `Policy Pipeline` | Membuktikan resolver mampu mengeliminasi label lemah dan menengahi paradoks kalkulasi yang tumpang tindih. | ✅ PASS |
| `RelationshipLifecycle` | Validasi peluruhan (*decay*) murni dan pergeseran status menjadi `DORMANT` dipicu murni oleh `world.dayPassed` (Day > 30). | ✅ PASS |
| `EvidenceStrength VO` | Verifikasi logika pembobotan dan asimetri penyebaran pada `RUMOR` vs `FIRST_PERSON`. | ✅ PASS |

## ⚠️ Known Limitations (Untuk diselesaikan di Sprint 12B)
Sebagaimana *roadmap* pemecahan sprint, area berikut **belum** dieksekusi dan menjadi fokus pada **Sprint 12B**:
- Pembentukan riil *Faction Engine* dan kapabilitas perekrutan anggota (*Membership*).
- Jaringan rambat reputasi (*Propagation Engine*) yang menyebarkan sentimen Faksi secara asimetris ke para anggotanya melalui filter kepribadian.

## 🔗 Referensi Repositori
- **ADR Baru:** `docs/adr/0021-faction-as-domain-aggregate.md`, `docs/adr/0022-active-relationship-decay.md`
- **Domain Value Objects:** `src/engine/npc/EvidenceStrength.js`
- **Lifecycle Service:** `src/engine/npc/RelationshipLifecycleService.js`
- **Policy Engine:** `src/engine/npc/RelationshipPolicy.js`
