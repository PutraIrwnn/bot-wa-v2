# ADR-0020: Relationship as Derived State

**Status:** Active
**Date:** 2026-07-17
**Context:** Sprint 11 - Relationship System

## Konteks & Masalah
Dalam pengembangan sistem Relationship (Sprint 11), muncul perdebatan arsitektural tentang bagaimana menyimpan dan mengevaluasi status relasi antar NPC atau NPC dengan Player. Hubungan sosial manusia dan fiksi tidak bersifat linear (misal: hanya diukur dari angka `Trust`). Sebagai contoh, seorang karakter bisa memiliki tingkat kepercayaan (Trust) yang tinggi terhadap musuhnya (karena ia percaya musuhnya selalu bertindak merusak), tetapi status hubungannya tetap "Musuh" (Enemy). 

Selain itu, jika label sosial seperti `['Enemy', 'Debtor']` disimpan secara permanen sebagai state bersamaan dengan histori relasinya, terdapat risiko terjadinya ketidakkonsistenan data. Jika riwayat relasi di-update namun label gagal disinkronkan, sistem akan memiliki kondisi *split-brain*.

## Keputusan
1. **Relationship Dimensions vs Labels**: Kita memisahkan antara Dimensi Relasi (seperti `trust`, `respect`, `fear`, `affinity`) sebagai **input/variabel state**, dengan Label Sosial (seperti `Rival`, `Companion`, `Life Saver`) sebagai **hasil turunan (derived state)**.
2. **Accumulated Immutable History**: Fundamental utama dari setiap relasi adalah histori kejadian. Setiap interaksi fundamental (misal: menepati janji, menyelamatkan nyawa) dicatat sebagai histori yang *immutable* (hanya bisa di-*append*, tidak bisa dihapus atau diedit). 
3. **Labels are Evaluated, Not Stored**: `RelationshipEngine` menggunakan sebuah **RelationshipPolicy** untuk mengevaluasi *Dimensions* dan *History* setiap kali state diminta. Jika diperlukan demi alasan performa, label dapat di-cache, tetapi sistem harus tahu cara me-*rebuild* label tersebut 100% dari history dan dimensions.

## Konsekuensi
- **Positif:** Tidak ada lagi *split-brain* state. Alasan AI dalam narasi akan selalu bersumber kuat pada sejarah kejadian, sesuai dengan filosofi "Relationships are accumulated history". Penambahan jenis label baru di masa depan hanya memerlukan perubahan pada `RelationshipPolicy` tanpa migrasi database label.
- **Negatif:** Proses untuk menarik data Relasi NPC membutuhkan komputasi tambahan saat evaluasi, namun ini merupakan *trade-off* yang sepadan demi integritas simulasi dunia *Aetheria*.
