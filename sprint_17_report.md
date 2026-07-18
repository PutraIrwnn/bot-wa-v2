# Sprint 17 Report (Narrative Polish)

## Scope yang dikerjakan
Sprint ini sepenuhnya fokus pada peningkatan *Prompt Layer* dan *Output Sanitization* untuk memastikan respons narasi AI (Gemini) lebih organis, emosional, bebas angka mekanikal, dan terasa seperti fiksi interaktif yang natural.

1. **`NPCPromptBuilder.js` Refactoring (Pre-prompt Translation):**
   - Data numerik seperti `trust: 85` dan `memory_health: 20` tidak lagi dikirim secara mentah ke LLM. Alih-alih, nilai tersebut diterjemahkan secara kategorial (misal: "Sangat ramah, bersahabat", atau "Agak linglung dan pelupa"). Hal ini secara dramatis memotong kecenderungan LLM membocorkan *stats* ke pengguna.
   - **Knowledge Injection:** NPCPromptBuilder kini menyaring memori NPC (`npc.beliefs`) dan secara otomatis menyisipkan 1-2 rumor paling terpercaya (skor > 70) ke dalam *context prompt*. Dengan ini, saat ditanya, NPC secara proaktif bisa menyinggung dinamika faksi maupun gosip terbaru.

2. **`PromptEngine.js` Refinement:**
   - Instruksi *System Prompt* diperbarui agar menuntut gaya bahasa layaknya novel fantasi pendek (elegan, puitis, maksimal 2-3 kalimat) sembari menguatkan aturan larangan output angka/statistik mekanikal.

3. **`NarrationSanitizer.js` Regex Tuning:**
   - Menerapkan sanitasi agresif. Memotong *AI-isms* / basa-basi bot (contoh: "Tentu, berikut adalah narasinya: ...") yang sering membuat putus *immersion*.
   - Menerapkan *fallback cleaner* untuk membersihkan setiap kemunculan angka statistik yang diapit oleh format teks seperti `[Trust: 80]` jika Gemini sedang berhalusinasi parah.

## Keputusan Desain Penting (ADR)
- **Batasan Omniscience (Knowledge Limit):** Sesuai permintaan Reviewer, penyisipan rumor difilter ketat (*score > 70* dan dibatasi maksimal 2 item) agar NPC tidak terkesan "mahatahu" atas seluruh gosip yang beredar di jalanan, menjaga arsitektur *Subjective Truth* peninggalan Sprint 13-15 tetap utuh.

## File yang diubah/ditambah
- `src/engine/ai/NPCPromptBuilder.js` (Logika terjemahan *stats* dan injeksi rumor)
- `src/engine/ai/PromptEngine.js` (Pembaruan konstutusi LLM)
- `src/engine/ai/NarrationSanitizer.js` (Regex pembersih output)
- `tests/unit/NPCPromptBuilder.test.js` [NEW]
- `tests/unit/NarrationSanitizer.test.js` [NEW]

## Hasil Test (Sprint 17)
```
▶ NPCPromptBuilder Unit Test
  ✔ 1. Angka mekanikal diterjemahkan ke semantic text (1.8838ms)
  ✔ 2. NPC hanya mengingat rumor yang memiliki beliefScore tinggi (0.3606ms)
✔ NPCPromptBuilder Unit Test (4.3132ms)

▶ NarrationSanitizer Unit Test
  ✔ 1. Menghapus AI-isms (Basa-basi chatbot) (2.2408ms)
  ✔ 2. Menghapus kebocoran statistik mekanikal (dalam kurung) (0.3351ms)
  ✔ 3. Menghapus kebocoran statistik mekanikal (tanpa kurung) (0.3121ms)
✔ NarrationSanitizer Unit Test (4.7071ms)
```

## Regresi terdeteksi (kalau ada)
Tidak ada regresi pada layer Domain, karena perombakan murni terjadi di Layer Representasi (Adapters/Prompting) yang bersifat *read-only* bagi Domain Model.
