# ADR 0000: Project Philosophy - Aetheria

## 1. Masalah apa yang diselesaikan?
Dalam pengembangan Bot WhatsApp AI, pendekatan konvensional memberikan seluruh kendali kepada LLM (Large Language Model) untuk menentukan *state* (misal: menentukan HP pemain, inventori, atau progress cerita). Hal ini menyebabkan game rentan terhadap halusinasi (hallucination), ketidakkonsistenan, dan biaya token yang membengkak karena *prompt* yang sangat besar. 

## 2. Alternatif apa yang dipertimbangkan?
- **AI-Driven Logic**: Menggunakan "Function Calling" atau parse JSON dari Gemini untuk memutasi state database (sangat mahal dan lambat).
- **Hard-coded RPG**: Menulis semua dialog NPC secara statis (mudah ditebak dan membosankan, bukan AI game).

## 3. Kenapa solusi ini dipilih?
Solusi yang dipilih adalah **Rule Engine Deterministik (Story First) + AI sebagai Narator**.
Prinsip utama proyek ini adalah: **AI NEVER DECIDES. AI ONLY DESCRIBES.**

Keputusan ini diambil karena:
- *Rule Engine* murni yang mengatur memori, uang, nyawa, dan cuaca sangat andal, *testable*, dan cepat.
- LLM hanya dipakai di lapisan paling luar (Presentasi) untuk mengubah *state* mentah (misal: `memory=5%, mood=linglung`) menjadi dialog yang dramatis.
- Jika Gemini tumbang (*API Limit* atau putus koneksi), *game* tidak mati karena *Rule Engine* tetap bisa mengirim teks *fallback* sederhana.

## 4. Bagaimana kita membuktikan bahwa solusi ini benar?
Dibuktikan melalui skenario pengujian di Sprint 1, di mana `test_world.js` mampu mensimulasikan perubahan *world state* dan degradasi ingatan NPC murni melalui Node.js, bahkan ketika modul AI sedang tidak diinisialisasi (*Graceful Fallback*).
