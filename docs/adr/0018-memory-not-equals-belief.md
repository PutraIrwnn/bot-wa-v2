# ADR 0018: Memory ≠ Belief

## 1. Konteks dan Masalah
Jika sistem menganggap bahwa setiap rumor yang didengar NPC otomatis dipercaya, maka dunia akan diwarnai oleh kepolosan massal. AI dapat memanipulasi reaksi NPC, dan *Echo Chamber* akan terbentuk tak terkendali. "Mengetahui" suatu gosip berbeda ranah dengan "Mempercayainya".

## 2. Keputusan
**NPC dapat mengetahui rumor tetapi tidak mempercayainya.**
- **Memory (NPCKnowledge):** Tempat penyimpanan data netral tentang apa yang didengar NPC, lengkap dengan rekam jejak pengirim (`heardFrom`).
- **Belief (NPCBelief):** Hasil kalkulasi deterministik oleh `BeliefEngine`. *Rule Engine* akan mengalkulasi `beliefScore` dan tingkat `certainty` berdasarkan *Trust* yang dimiliki NPC tersebut terhadap sumber gosip, ditambah metrik kredibilitas rumor secara global.
- AI HANYA menyuarakan *Belief* ini. AI tidak berhak menentukan apakah NPC percaya atau menolak gosip.
