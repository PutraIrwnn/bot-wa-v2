# ADR 0002: Publish Async Fire-and-Forget

## 1. Masalah apa yang diselesaikan?
Event Bus akan mempublikasikan event ke banyak *listener*. Beberapa *listener* akan mengeksekusi *logic* secara sinkron (seperti perhitungan memori), namun ada juga *listener* yang memerlukan proses asinkron berat (seperti menyimpan ke *database* atau memanggil *network API* kelak). Tantangannya: Apakah `publish()` harus me-*return* `Promise` dan meng-`await` semua *listener* (`Promise.all`), atau dilepas begitu saja (*fire-and-forget*)?

## 2. Alternatif apa yang dipertimbangkan?
- **Await All (Synchronous Completion)**: Menggunakan `await Promise.all(callbacks)`. Sangat aman untuk menjaga keutuhan *state*, tetapi jika ada satu *listener* yang ter-*block* selama 5 detik, seluruh *response loop* WhatsApp akan tertunda (latency buruk).
- **Queue System (Redis/RabbitMQ)**: *Over-engineering* untuk *scope* Node.js tunggal, membuat arsitektur berat untuk dipasang.

## 3. Kenapa solusi ini dipilih?
Solusi yang dipilih adalah **Async Fire-and-Forget**.
`publish()` tidak akan `await` siapa pun. Semua callback dibungkus dalam `Promise.resolve(callback).catch(...)` dan dijalankan terpisah dari utas pemanggil. 
- Alasan utamanya adalah performa: *Event Bus* dijamin tidak memblokir respon *bot* kepada pengguna.
- Pemain yang menekan tombol aksi (memanggil `publish()`) akan langsung mendapatkan respon UI secara instan. Penyebaran rumor atau penulisan *database* dilakukan di *background*.

## 4. Bagaimana kita membuktikan bahwa solusi ini benar?
Dibuktikan dengan dua *unit test* di `EventBus.test.js`:
- *Test "Async Fire-and-Forget"* memastikan bahwa fungsi *fast listener* tetap berjalan walaupun *slow listener* memakan waktu lama.
- *Benchmark latency* (`EventBus.bench.js`) membuktikan latensi `publish` untuk 1000 *subscribers* berada di sub-milidetik (< 1 ms), membuktikan tidak ada pemblokiran (*blocking*).

## 5. Keterbatasan dan Asumsi Pemanggil (Caller Constraints)
Konsekuensi dari *fire-and-forget* adalah:
- **Caller (Pemanggil)** tidak boleh berasumsi bahwa proses *subscriber* telah selesai saat `publish()` me-*return*.
- **Event Ordering**: EventBus menjamin **Dispatch Order**, bukan **Completion Order**. Jika kita mem-publish Event A lalu Event B, EventBus menjamin *Listener* dipanggil untuk A lalu B secara berurutan. Namun, jika eksekusi *Listener* A membutuhkan *delay* 5 detik secara asinkron, *Listener* B bebas untuk selesai terlebih dahulu. Urutan kedatangan dijamin, urutan penyelesaian tidak dijamin.
