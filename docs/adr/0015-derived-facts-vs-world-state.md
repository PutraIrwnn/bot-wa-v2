# ADR 0015: Derived Facts vs World State

## 1. Konteks dan Masalah
Jika `StoryEngine` setelah menemukan fakta (Misal: Panen Gagal) langsung memperbarui status ke database (misal: `world.agriculture = failed`), maka StoryEngine telah melanggar prinsip *Single Responsibility* dan bertindak sebagai dewa *Decision Maker* yang mengubah *State* alam semesta. Ini memicu *spaghetti dependencies*.

## 2. Keputusan
**Story Event tidak otomatis menjadi World State. Story Event adalah penemuan; World State adalah konsekuensi.**

Alur baku Aetheria:
1. **Domain Events** (Contoh: Hujan Badai Berlarut-larut)
2. **Story Engine** -> Mengevaluasi keadaan alam.
3. **Story Event (Transient)** -> Diterbitkan (Contoh: `story.harvestFailed`). Event ini menguap setelah selesai dipancarkan.
4. **Consequence Evaluation / World Engine** -> Mendengarkan `story.harvestFailed`. Ia yang memiliki otoritas untuk mempermanenkan dampaknya menjadi **World State Update** (Contoh: `foodSupply = LOW`).

Keuntungan arsitektur ini:
- Story tetap pasif, sebatas hasil observasi.
- Konsekuensi permanen tetap terkendali oleh pemegang wilayah *domain* sesungguhnya (WorldEngine/ConsequenceEngine).
- Memastikan Aetheria dapat direproduksi (*replayable*) secara deterministik.
