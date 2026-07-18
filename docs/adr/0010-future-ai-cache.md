# ADR 0010: Future AI Cache Strategy

## 1. Masalah apa yang diselesaikan?
Generasi teks menggunakan LLM (*Large Language Model*) membutuhkan waktu eksekusi yang nyata (2-5 detik) dan menelan kuota *Token API* yang berbayar. Ketika fitur *Daily News* atau *World Weather Broadcast* dikembangkan, ribuan pemain mungkin akan menerima "Narasi" yang sama persis berdasarkan *World State* yang identik. Merender teks berulang-ulang untuk kondisi yang ekuivalen adalah pemborosan infrastruktur dan finansial.

## 2. Rencana Implementasi Masa Depan
Dokumen ini mengusulkan konsep **Deterministic Prompt Hash & Narration Cache**.
- Setiap kali `NarrationContext` dikompilasi oleh `PromptEngine`, keseluruhan state (*Trust, Memory, Cuaca, Event*) akan di-hash menggunakan algoritma ringkas (Misal: MD5 atau SHA-1).
- `Hash String` tersebut menjadi *Key* untuk memori lokal (*Redis* atau *In-Memory Map*).
- Jika *Key* ditemukan, sistem tidak akan menembak API Gemini, melainkan langsung menyajikan *String Narasi* historis dari dalam *Cache*.
- *Cache* ini bisa diset *Time-To-Live* (TTL) tertentu atau dibersihkan saat ada perubahan mendasar pada state dunia.

## 3. Keputusan
Saat ini, **AI Cache BELUM DIBUAT** (Sprint 6). ADR ini berfungsi sebagai rambu-rambu desain bagi pengembang untuk mempersiapkan fondasinya, mengantisipasi fitur broadcast/narasi skala besar pada fase evolusi *Aetheria* selanjutnya.
