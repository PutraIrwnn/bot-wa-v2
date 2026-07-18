# ADR 0009: AI Boundary (LLM as Narrator, Not Decision Maker)

## 1. Masalah apa yang diselesaikan?
Integrasi *Large Language Models (LLM)* ke dalam game sering kali menciptakan godaan untuk melepaskan kendali penuh *state* dunia kepada AI (misal: membiarkan AI menentukan apakah nyawa *player* berkurang atau tidak, atau apakah *NPC* menjadi benci pada *player*). Pendekatan ini merusak sifat **determinisme**, dan membuat *debugging* sistem mustahil dilakukan karena halusinasi AI berpotensi merusak keutuhan matriks persisten game (seperti *inventory*, *trust*, dan *quests*).

## 2. Keputusan
Kami menetapkan **Konstitusi AI (AI Boundary)** yang ketat: **AI Is Just an Adapter (Narrator Layer)**.
AI dilarang keras untuk membuat keputusan mekanikal yang mengubah struktur *Domain*.

**YANG BOLEH DILAKUKAN AI:**
- **Menerima Konteks (Read-Only):** AI boleh disuplai data yang 100% dipasok oleh Domain (misal: *World State, NPC Trust, Memory Summary, Cuaca*).
- **Menghasilkan Output Format Kosmetik:** Dialog NPC, Teks Narasi, Berita Harian, Deskripsi Pemandangan.
- Berperan sebagai **INarrationProvider**.

**YANG HARAM DILAKUKAN AI:**
- Menghasilkan nilai absolut yang disuntik kembali ke *database* (seperti `Trust: 90`, `Inventory: [Pedang]`, dsb).
- Menembakkan *Domain Event* (`eventBus.publish()`).
- Mengubah alur *Quest Completion*.

## 3. Eksekusi
- *Rule Engine* tetap menjadi "Raja". Jika *Player* membantu Rina, fungsi *Action Engine* lah yang menambahkan poin *Trust*, **BUKAN** Gemini.
- *Prompt Engine* bertugas mengonstruksi *System Prompt* dari *Narration Context* murni (pasif) dan menyerahkannya ke *LLM Adapter*.
- Hasil *LLM* dilewatkan ke `NarrationSanitizer` untuk pembersihan spasi berlebih, limitasi panjang, dan penangkal injeksi format (misalnya membuang tag Markdown liar), lalu dikembalikan sebagai *Application Response*.
