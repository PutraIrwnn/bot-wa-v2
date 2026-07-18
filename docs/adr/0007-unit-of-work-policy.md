# ADR 0007: Unit of Work Usage Policy

## 1. Masalah apa yang diselesaikan?
Antarmuka `IUnitOfWork` telah disiapkan dalam infrastruktur. Namun, jika penggunaannya tidak diatur ketat, setiap pembaruan (*update*) sekecil apapun (misal: *saveState* dari NPC tunggal) akan dibungkus dengan perintah `BEGIN TRANSACTION` dan `COMMIT`. Hal ini merupakan *overhead* yang tidak perlu dan dapat mencekik performa *database connection pool*.

## 2. Keputusan
**Unit of Work HANYA diizinkan untuk operasi multi-kueri yang mensyaratkan atomisitas.**

- Jika Engine hanya melakukan satu operasi kueri (seperti meng-*update* *Trust* Rina), maka fungsi tersebut **TIDAK BOLEH** dipanggil di dalam scope `UnitOfWork`. Fungsi itu langsung mengeksekusi kueri independen.
- Jika Engine mengeksekusi aksi yang bertautan kuat dan pantang gagal separuh (Misal: *Trading System*, di mana Sistem harus memotong *Gold* Pemain secara simultan dengan menambahkan barang ke *Inventory*), maka proses itu **WAJIB** berada di dalam `UnitOfWork`.

Keputusan ini menjaga sistem tetap gesit dengan transaksi autocommit yang bebas ongkos tinggi (*lock overhead*), sembari menyediakan sabuk pengaman hanya di tempat yang memerlukannya.
