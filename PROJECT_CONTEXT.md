# 🤖 Bot WhatsApp Project Context (Full System Overview)

## 📌 Informasi Proyek
- **Path Proyek:** `C:\laragon\www\bot-whatsapp`
- **Library Utama:** `@whiskeysockets/baileys` (Koneksi WhatsApp Web API)
- **Dependencies Kunci:** `axios`, `cheerio` (Web Scraping), `rss-parser`.
- **Status Saat Ini:** Berjalan lancar, stabil, dan semua command inti telah teruji kebal terhadap berbagai *error/blocking*.

## 📂 Daftar Fitur Lengkap yang SUDAH TERSEDIA
Bot ini sudah memiliki banyak fitur canggih yang berada di dalam folder `src/commands/`. **JANGAN menyarankan untuk membangun ulang fitur-fitur di bawah ini karena sudah selesai dan berjalan sempurna:**

1. **`!ai`** : Integrasi AI ChatGPT/Gemini untuk mengobrol pintar dengan bot.
2. **`!berita`** : Mengambil berita terbaru yang terkurasi.
3. **`!cuaca`** : Mengecek ramalan cuaca terkini di berbagai kota.
4. **`!downloader`** : Mengunduh media dari platform sosial (YouTube, TikTok, Instagram, dll).
5. **`!google`** : Melakukan pencarian cerdas dari Google Search.
6. **`!hargaemas`** : Mengecek harga emas Antam (dilengkapi *Natural Language Weight Parser* dan *Cloudflare Bypass*).
7. **`!imagine`** : AI Image Generation (Teks ke Gambar).
8. **`!info`** : Menampilkan informasi sistem bot.
9. **`!jadwalbola`** : Jadwal bola *real-time* via TheSportsDB (dilengkapi *Multi-Timezone Engine WIB/WITA/WIT* & HTML Scraper khusus Piala Dunia untuk mencari nama Stadion).
10. **`!kurs`** : Konversi mata uang dengan *Natural Language Parser* (Bisa mengerti input bahasa manusia seperti `10000 rp to euro`).
11. **`!menu`** : Menampilkan daftar seluruh perintah yang tersedia.
12. **`!ping`** : Mengecek latency/koneksi bot.
13. **`!sticker`** : Membuat stiker WhatsApp dari gambar/video.
14. **`!wiki`** : Pencarian Wikipedia (dilengkapi *MediaWiki Action API Fuzzy Search* untuk meminimalisir salah eja judul).

---

## 🚀 Log Perbaikan Mayor Sebelumnya (Refactoring History)
*Catatan ini penting agar AI tidak mengulangi kesalahan coding lama saat mengedit file terkait.*

### 1. Wikipedia (`!wiki`)
- **Fix:** Sebelumnya sering terkena error `403 Forbidden` dan gagal mencari judul yang tidak sama persis (misal: "neymar junior" gagal, harus "Neymar"). Diselesaikan dengan menyuntikkan custom `User-Agent` dan memanfaatkan **MediaWiki Action API (Fuzzy Search)** sebagai filter perantara.

### 2. Jadwal Sepakbola (`!jadwalbola`)
- **Fix:** Meninggalkan penggunaan RSS Feed biasa karena rentan *blocked/hallucination*. Beralih penuh menggunakan **API TheSportsDB** (`eventsday.php`). 
- Dibuat **HOTFIX Piala Dunia** berupa HTML Scraper langsung ke web TheSportsDB (League 4429) untuk bypass API Cache sehingga jadwal H-1 dan stadion asli bisa tampil seketika. Menerapkan konversi zona waktu UTC ke **(WIB, WITA, WIT)** secara otomatis.

### 3. Harga Emas Antam (`!hargaemas`)
- **Fix:** Logam Mulia memasang Cloudflare sehingga request axios terblokir `403 Forbidden`. Pindah menggunakan target *scraping* alternatif `harga-emas.org`. 
- Menambahkan **Natural Language Weight Parser** sehingga bot memahami input seperti `!hargaemas 1kg`, `50g`, `0.5`, dan mengkalkulasi estimasi harga grosir (berbasis rate 100gr) jika pecahan besar tidak ada di tabel.

### 4. Konversi Kurs (`!kurs`)
- **Fix:** Dibuat sangat *human-friendly* menggunakan Regex. Bot mengenali argumen natural dan wildcard bahasa seperti `!kurs 10.000 rupiah`, `!kurs 50 USD ke EUR`. Tidak lagi terpaku pada 3 huruf kode ISO kaku.

---
## 💡 Target Selanjutnya Untuk Sesi Baru
- Bot sudah memiliki fitur *Downloader*, *AI Chat*, *Image Gen*, *Sticker Maker*, dll.
- Saran untuk sesi selanjutnya adalah **membuat fitur baru yang belum ada di daftar di atas**, seperti fitur game (Tebak Kata/Gambar), fitur database pengguna (Leveling/XP), fitur grup (Admin Tools: Kick/Ban/Welcome Message), atau mengintegrasikan Database sungguhan jika belum ada.
