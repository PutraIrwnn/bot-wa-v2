# Sprint 18 Report (Dinamisasi Bobot Faksi & Penambalan RNG)

Sprint 18 berhasil diselesaikan dengan berfokus pada dua area perbaikan:
1. **Penyempurnaan Mekanik Reputasi:** Membuat fluktuasi *Faction Trust* bersifat dinamis dan representatif sesuai tingkat pengaruh NPC di faksinya (*Dynamic Weight*).
2. **Keamanan Determinisme RNG:** Menambal potensi celah pembuatan ID pada fase *Cold-Start* (Tick 0) agar dunia Aetheria 100% deterministik dan dapat dimainkan ulang dari riwayat rekam jejak.

## 🚀 Pencapaian Utama

### 1. Faction Role Weight (Dinamisasi Bobot Faksi)
*Skema Database (`init_world.sql`)* dan lapisan *Persistence (`MySqlNpcRepository`)* telah diperbarui dengan menambah atribut `faction_role_weight`. Nilai ini membedakan bobot aksi menolong pimpinan faksi versus prajurit kelas bawah.
*Engine Layer (`NPCEngine.js`)* sekarang mempropagasi nilai reputasi faksi (*deltaTrust*) secara spesifik mengambil besaran `npc.faction_role_weight`, menggantikan konstanta (+5) yang di-*hardcode* pada iterasi sebelumnya.

### 2. Eliminasi RNG Non-Deterministik (ActionEngine & RumorEngine)
Penggunaan `Math.random()` dan *in-memory counter* telah dibuang seutuhnya:
- *Shuffle* daftar Rumor (`ActionEngine`) kini menggunakan deterministik Fisher-Yates yang mendapatkan *seed*-nya secara dinamis dari **Hash State Rumor Aktif** digabungkan dengan `player_id`. Urutan penyajian rumor hanya berubah secara natural bila dunia berkembang (ada rumor yang mati/*decay* atau rumor baru yang ditambahkan).
- *ID Generator* Rumor Faksi (`RumorEngine`) kini memakai determinisme berbasis `currentTick` di-salt dengan hash dari teks kejadian, menjaga siklus pembuatan rumor 100% *reproducible*.

### 3. Mitigasi Tabrakan Hash pada Cold-Start (Tick 0)
Menindaklanjuti observasi terhadap kondisi *server restart* (ketika *tick* pertama belum masuk, `currentTick` = `undefined`), telah ditambahkan lapisan *fallback counter* lokal (`this._tick0Counter`). Pengamanan berlapis ini memastikan tabrakan ID tidak akan terjadi sekalipun dua interaksi faksi yang teks dan lokasinya sama persis lahir bersamaan pada saat server dihidupkan. Skenario ini tervalidasi melalui penambahan test khusus di `RumorEngine.test.js`.

## 📊 Hasil Pengujian
Sistem melewati seluruh pengujian (*Full Test Suite*) dengan mulus tanpa ada regresi di lapisan logika/domain (total **80 test PASS**). Tidak ada *breaking changes* pada struktur mekanik yang telah terbangun di Sprint 12-17.

```text
▶ RumorEngine Unit Test
  ✔ 1. FactionRivalryFormed creates a negative faction rumor (14.4103ms)
  ✔ 2. FactionAllianceFormed creates a positive faction rumor (1.1591ms)
  ✔ 3. Tick 0 Cold-start does not produce collision (1.0138ms)
```

## ⚠️ Langkah ke Depan
Dengan tuntasnya isu RNG dan reputasi faksi di Sprint 18 ini, fondasi simulasi sosial Aetheria semakin solid. Kini Aetheria lebih dari siap untuk melangkah ke penciptaan fitur tingkat lanjut, misal: **NewsEngine** (membentuk koran/sirkulasi berita regional) atau penyajian **Observability Dashboard** bagi Developer/Narrator.
