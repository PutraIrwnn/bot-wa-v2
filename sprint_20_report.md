# Sprint 20 Report (News Engine / Kabar Dunia)

Eksekusi Sprint 20 telah sukses! Fokus pada *sprint* ini adalah membangun kanal representasi informasi yang menarik dengan mengubah status gosip jalanan menjadi media massa di dalam simulasi Aetheria.

## 🚀 Pencapaian Utama

### 1. `NewsEngine` Berjalan sebagai Aggregator
`NewsEngine.js` berhasil diimplementasikan di *Domain Layer*. 
- Algoritmanya bekerja bersih: setiap *event* `DayPassed` dikumandangkan oleh `EventBus`, `NewsEngine` secara deterministik menyeleksi hingga 5 Rumor teratas. 
- *Sorting* memprioritaskan Rumor dengan *Credibility* (kebenaran logis tertinggi) disusul *Heat* (paling sering dibicarakan).
- State mekanikal disatukan dalam bentuk objek statis bernama `NewsEdition` beridentitas `edition_day_N`.

### 2. Implementasi Cerdas *Lazy Caching*
Kita sepakat mengamankan *cost* operasi LLM dari potensi kebocoran. Di dalam `ActionEngine.js`:
- Fitur surat kabar mengusung strategi *"On-demand Generation"*.
- Jika di hari ke-42 tidak ada satupun *player* yang memanggil perintah `!berita`, maka AI tidak akan di-*trigger* dan biaya tetap 0.
- Jika pemain pertama memanggil `!berita`, API Gemini akan menerjemahkan data mekanikal hari itu menjadi kisah jurnalistik, kemudian ActionEngine akan menyimpan hasil tersebut di struktur *Cache*.
- Pemain kedua, ketiga, dan seterusnya pada hari yang sama akan langsung membaca memori *Cache* tersebut (waktu muat instan) dengan gaya penulisan yang 100% konsisten. Saat hari berganti (`edition_day_43`), objek *cache* secara otomatis di-*overwrite*.

### 3. Pemisahan *Prompt Builder*
Mekanik *prompter* telah dirapikan ke `NewsPromptBuilder.js`. Arahan di dalam *prompt* LLM memaksa AI untuk:
- Bersikap layaknya koran harian atau pengumuman *Town Crier*.
- Menerjemahkan angka probabilitas rahasia (contoh kredibilitas 90%) menjadi frasa deskriptif natural *"fakta yang tak terbantahkan"*.

### 4. Bebas dari *Breaking Changes*
Sprint 20 berhasil dihubungkan ke `index.js` utama (*bootstrap* Aetheria) tanpa mengubah sedikitpun sirkuit `RumorEngine` dan integrasi WhatsApp yang baru saja kita amankan pada Sprint 19.

Total 93 *Unit / Integration Test* telah berjalan hijau (`PASS`), termasuk `NewsEngine Unit Test`.

## ⚠️ Langkah ke Depan
Fitur *News Engine* berhasil menutup *gap* interaksi naratif. 
Kini sistem siap dieksplorasi lebih lanjut. Sesuai arah diskusi dan _roadmap_ yang kita rencanakan sebelumnya, **Sprint 21** dapat berupa **Dashboard Panel / UI (Eksternal)** atau mulai menyelami mekanik **Dynamic Quest / Mission System** di atas arsitektur simulasi faksi.
