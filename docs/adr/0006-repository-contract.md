# ADR 0006: Repository Return Contract

## 1. Masalah apa yang diselesaikan?
Fungsi persistensi (seperti `saveState()`) seringkali hanya mengembalikan tipe boolean (`true` jika berhasil, `false` jika gagal). Hal ini menciptakan blind-spot operasional. Pemanggil (*caller*) tidak mendapatkan konteks tambahan seperti jumlah baris yang terpengaruh, alasan kegagalan spesifik, durasi kueri, atau potensi konflik yang terjadi.

## 2. Alternatif apa yang dipertimbangkan?
- **Throw Exception:** Membiarkan repository melempar error (*throw*) untuk menandakan kegagalan. (Hal ini sudah berjalan, namun sulit menangani metrik sukses pasca-operasi).
- **Return Object (ActionResult):** Mengembalikan DTO khusus dari Repository yang membungkus status keberhasilan, data hasil, serta peringatan (*warnings*) atau pesan kesalahan jika terjadi.

## 3. Keputusan
Kami menetapkan **Repository Return Contract**. Mulai dari pengembangan selanjutnya, *Repository* tidak lagi diperkenankan mengembalikan nilai primitif `boolean`. Sebagai gantinya, harus mengembalikan objek berstruktur kaya informasi, misalnya:

```javascript
{
  success: true,
  data: { ... },
  affectedRows: 1,
  error: null
}
```

Pendekatan ini mempermudah sistem *Error Handling* di masa depan untuk menambah kapabilitas seperti pengulangan otomatis (*auto-retry*), pengumpulan *metrics*, atau log observabilitas tanpa memecahkan kontrak *API Public* dari Repository tersebut.
