# ADR 0001: Event Bus vs Mediator

## 1. Masalah apa yang diselesaikan?
Aetheria memiliki banyak sistem (NPC, Rumor, Explore, Story, News) yang harus bereaksi terhadap tindakan pemain (misalnya `player.helpedNpc`). Tantangannya adalah bagaimana membuat sistem-sistem ini berkomunikasi tanpa menjadi *spaghetti code* atau menciptakan *God Object* yang mengetahui seluruh aturan *game*.

## 2. Alternatif apa yang dipertimbangkan?
- **Mediator Pattern / GameManager**: Satu kelas pusat (`GameManager`) yang menerima semua *input* dan memanggil modul satu per satu (`NPC.update()`, `Rumor.add()`). Kekurangannya: Kelas ini akan membengkak dan sulit diuji. Setiap penambahan fitur baru harus mengubah `GameManager`.
- **Observer Pattern (Direct)**: Setiap modul menjadi *Observer* dari modul lainnya (NPC meng-observe Explore). Kekurangannya: Terjadi *tight-coupling* antar modul (circular dependencies).
- **Redux-style Store**: Terlalu kompleks untuk arsitektur Node.js sederhana yang tidak membutuhkan UI Reactivity.

## 3. Kenapa solusi ini dipilih?
Solusi yang dipilih adalah **Event Bus (Pub/Sub) murni**.
- Pembuat kejadian (Publisher) dan pendengar kejadian (Subscriber) benar-benar terisolasi. `ExploreEngine` mem-publish kejadian bahwa pemain menolong NPC, tanpa perlu tahu apakah di dunia ada fitur rumor atau tidak.
- Modul baru dapat ditambah (misalnya fitur `WeatherEngine`) dengan hanya me-*listen* `world.dayPassed` tanpa perlu mengubah baris kode satu pun di modul lain.

## 4. Bagaimana kita membuktikan bahwa solusi ini benar?
Keterpisahan ini dibuktikan melalui `test_eventbus.test.js` dan simulasi terintegrasi. Kegagalan (error throw) pada satu *subscriber* (misalnya `RumorEngine` crash) tidak akan membuat fungsi `publish()` terhenti atau menggagalkan pengolahan *state* di `NPCEngine`. Terisolasi 100%.
