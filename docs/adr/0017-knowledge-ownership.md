# ADR 0017: Knowledge Ownership

## 1. Konteks dan Masalah
Seiring menjamurnya berbagai layer *Engine* (World, Behavior, Story, Rumor), terdapat risiko di mana *Engine* tertentu menulis atau mengedit data yang bukan miliknya. Misalnya, `RumorEngine` men-delete isi memori di profil NPC. Praktik *God Object* ini akan menyulitkan *debugging* dan melanggar prinsip kepemilikan terdesentralisasi.

## 2. Keputusan
Setiap *Engine* HANYA berhak mengubah repositori miliknya sendiri. Tidak ada intervensi *query* pengubahan secara langsung.
- **WorldEngine**: Memiliki kebenaran objektif (World State permanen).
- **StoryEngine**: Memiliki wewenang observasi fakta (Namun tidak menyimpan ke DB).
- **RumorEngine**: Memiliki tabel/rumor global (`RumorDTO`). Ia hanya bisa berteriak "Rumor ini kedaluwarsa".
- **NPCEngine**: Memiliki tabel memori individu NPC. Hanya `NPCEngine` yang berhak mendengar teriakan *RumorEngine* lalu secara mandiri menghapus memori NPC-nya (bila memang si NPC ingin melupakan).

Batas-batas sakral ini (*Knowledge Ownership*) dikukuhkan demi melindungi stabilitas Hexagonal Architecture.
