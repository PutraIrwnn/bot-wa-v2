# ADR 0014: Story is Derived, Never Authored

## 1. Konteks dan Masalah
Di game tradisional, cerita dan *quest* ditulis secara eksplisit oleh penulis naskah (*Authored*). Di Aetheria, jika *Story Engine* atau AI diizinkan merangkai peristiwa acak demi membuat drama (Misalnya AI tiba-tiba memutuskan "Hari ini Rina diserang serigala"), maka sistem deterministik kita akan hancur dan status dunia tidak dapat diprediksi (menjadi inkonsisten).

## 2. Keputusan
**Story is Derived, Never Authored.**
Story Engine dan AI tidak boleh secara ajaib menciptakan atau menulis cerita yang mengubah status alam.
- **Story Engine HANYA BERTINDAK sebagai PENGAMAT (Observer)**. Ia melihat hubungan sebab-akibat yang *sudah terjadi* di dunia, mengevaluasinya berdasarkan `StoryRules` yang kaku, lalu mengumumkan kesimpulan tersebut.
- Contoh yang sah: NPC kumpul di pasar > 3 orang -> Story Engine mengobservasi ini -> Mengevaluasi rule -> Mempublikasikan `story.marketBusy`.
- AI dilarang keras menentukan kelanjutan nasib; AI hanya menceritakan konsekuensi dari peristiwa yang sudah ditetapkan oleh Rule Engine / Story Engine.
