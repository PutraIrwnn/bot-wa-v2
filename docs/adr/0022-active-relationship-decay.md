# ADR-0022: Active Relationship Decay

**Status:** Active
**Date:** 2026-07-17
**Context:** Sprint 12 - Social Systems (Living Society)

## Konteks & Masalah
Dalam pengembangan Relationship Lifecycle, hubungan tidak seharusnya statis. Seiring berjalannya waktu atau ketidakhadiran interaksi, hubungan harus meluruh (decay) dan berpindah status (misal: dari `Active` menjadi `Dormant` atau `Archived`). 
Masalahnya adalah **kapan** dan **siapa** yang mengeksekusi proses decay tersebut?
Jika kita menggunakan metode *Passive Evaluation* (malas/lazy-loading)—di mana decay dihitung hanya pada saat fungsi `loadRelationship()` dipanggil—maka state dunia tidak lagi deterministik murni di level *event stream*. Kondisi dunia akan bergantung pada "kapan pengamat melihatnya" (mirip fisika kuantum), yang merusak prinsip dasar keterlacakan log (traceability) *Aetheria*.

## Keputusan
Relationship Decay harus bersifat **Active dan Event-Driven**.
Kita mendelegasikan proses ini kepada sebuah `RelationshipLifecycleService` yang akan bertindak sebagai *subscriber* terhadap event waktu murni dari `WorldEngine`, secara spesifik event `world.dayPassed` (atau sejenisnya).
Ketika hari berganti di dalam dunia fiksi:
1. Layanan siklus hidup akan mengevaluasi seluruh relasi aktif.
2. Jika waktu sejak interaksi terakhir (`lastInteractionTime`) melampaui ambang batas, layanan akan memublikasikan event `relationship.decayed` atau mengubah status menjadi `DORMANT`/`ARCHIVED`.

## Konsekuensi
- **Positif:** Deterministik, konsisten dengan *Event Bus*, dan sangat *replayable*. Perubahan status dan dimensi bisa dipantau langsung dari log event, bukan tersembunyi dalam *getter* pasif.
- **Negatif:** Jika relasi mencapai jumlah jutaan, iterasi harian pada semua relasi aktif bisa memakan memori/CPU (*bottleneck*). Ke depannya, kita harus menerapkan teknik optimasi kueri (seperti hanya memanggil row dengan `lastInteractionTime < ambangBatas`) atau melakukan *batch processing*.
