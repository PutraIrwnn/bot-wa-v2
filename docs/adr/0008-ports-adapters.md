# ADR 0008: Ports & Adapters Boundary (Transport Never Enters Domain)

## 1. Masalah apa yang diselesaikan?
Bot AI yang terikat erat (*tightly coupled*) dengan platform pesannya (misal: WhatsApp) tidak mungkin di-*porting* ke platform lain (seperti Discord, Telegram, atau API Web) tanpa membedah dan merombak seluruh baris kode. Jika domain logika mulai menyadari keberadaan fitur "Kirim WhatsApp", sistem tersebut terkontaminasi dengan *Transport Layer Detail*.

## 2. Keputusan
Arsitektur Aetheria mengadopsi prinsip ketat **Hexagonal Architecture (Ports and Adapters)**.
Mantra arsitekturnya adalah: **Transport Never Enters Domain.**

**Aturan Main:**

✅ **YANG BOLEH DIKETAHUI DOMAIN:**
- *Repository Interfaces* (`INpcRepository`, dsb.)
- *EventBus* & *Domain Events* (`player.helpedNpc`)
- *Domain Entities* (NPC, Rumor, Player)
- Mengembalikan *Application Response Object* murni (tanpa peduli protokol).

❌ **YANG HARAM DIKETAHUI DOMAIN:**
- `Baileys` (Library WhatsApp)
- *WhatsApp JID* (Format identitas `xxxx@s.whatsapp.net` harus diterjemahkan dulu menjadi sekadar *Player ID* abstrak).
- *QR Session* / Auth Info
- *Message ID* / *Quoted Message*
- Media Upload (Image/Voice Note)
- Tidak ada perisitiwa bernama `system.sendMessage` sebagai rutinitas normal balasan *(Reply)*.

## 3. Eksekusi
*Action Engine* berdiri sebagai konduktor tipis di wilayah adaptasi batas. 
Ia menerima input, memvalidasi parameter, memerintahkan domain bekerja, dan menyatukan hasilnya menjadi `ActionResult { messages: [...], events: [...], errors: [...] }`.
Lapisan terluar (yakni `WhatsAppAdapter` dan `MessageAdapter`) bertanggung jawab penuh menerjemahkan array pesan aplikasi tersebut menjadi protokol socket WhatsApp yang sesungguhnya.
