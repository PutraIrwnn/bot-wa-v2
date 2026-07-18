# ADR 0016: Knowledge Lifecycle

## 1. Konteks dan Masalah
Tanpa siklus yang tegas, informasi yang pernah muncul di dunia Aetheria (misal sebuah panen yang gagal) akan diingat selamanya oleh semua NPC dan ditanyakan terus-menerus oleh pemain bertahun-tahun setelahnya. Informasi perlu lapuk (*decay*), dilupakan, dan ditransmisikan.

## 2. Keputusan
Kita memperkenalkan **Knowledge Lifecycle** yang terdiri dari 5 tahapan deterministik:
1. **Story Event**: Observasi murni (Sesaat).
2. **Rumor (Created)**: Hasil kristalisasi *Story Event* ke dalam sebuah bentuk sosial berumur. Punya *Heat* dan *Credibility*.
3. **NPC Memory**: Pengetahuan NPC secara mandiri tentang Rumor tersebut (Punya *Confidence* masing-masing).
4. **Decay**: Rumor kehilangan *Heat* seiring waktu secara global.
5. **Forgotten**: NPC akan menghapus memori mereka bila tingkat *confidence* mereka habis atau rumor global lenyap.

Ini menjamin bahwa gosip masa lalu tidak akan menumpuk menjadi beban database permanen (kecuali menjadi sejarah tertulis).
