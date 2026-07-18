# ADR-0021: Faction as Domain Aggregate

**Status:** Active
**Date:** 2026-07-17
**Context:** Sprint 12 - Social Systems (Living Society)

## Konteks & Masalah
Ketika dunia *Aetheria* berkembang dari skala individu menjadi skala masyarakat (Society), muncul kebutuhan untuk mengelompokkan NPC ke dalam organisasi atau kelompok tertentu (misal: Gilda Pedagang, Pasukan Penjaga). 
Bagaimana kita mendesain "Faction" secara arsitektural? 
Ada dua pendekatan salah yang sempat dipertimbangkan:
1. **Sebagai "Super-NPC"**: Di mana Faction memiliki *Trust*, *Belief*, dan *Memory* selayaknya karakter. Hal ini berisiko membuat struktur data tercampur (contoh: menggoda developer untuk memberi *HP* atau *Inventory* pada Faksi). Faksi bukanlah manusia.
2. **Sebagai sekadar "Tag/Label"**: Di mana NPC sekadar diberi properti `faction: 'Merchant'`. Ini terlalu lemah karena tidak bisa menampung dinamika reputasi kelompok, aturan internal, atau *shared knowledge*.

## Keputusan
Kita menetapkan bahwa **Faction adalah sebuah Domain Aggregate tersendiri**. 
Sebagai agregat, ia berdiri terpisah dari NPC dengan skema yang berbeda. Entitas Faction memiliki:
- `id` dan `name`
- `members` (relasi agregasi ke NPC)
- `reputationProfile` (bagaimana dunia memandang faksi ini)
- `goals` dan `policies` (tujuan dan aturan kolektif)
- `sharedKnowledge` (informasi yang menyebar secara eksklusif dalam faksi)

Sementara itu, entitas NPC (dalam NPC Engine) akan memiliki pointer asosiasi `belongsTo` yang menunjuk ke ID Faction ini.

## Konsekuensi
- **Positif:** Tanggung jawab (Separation of Concerns) terjaga sangat baik. Faksi tidak akan bercampur fungsinya dengan NPC. Faksi bisa memiliki mekanik tersendiri tanpa merusak Domain NPC.
- **Negatif:** Interaksi antara reputasi pemain terhadap Faksi dengan reaksi individu anggota Faksi harus dijembatani oleh *Propagation Engine* dan difilter oleh kepribadian individu NPC, yang membutuhkan kompleksitas komputasi tambahan.
