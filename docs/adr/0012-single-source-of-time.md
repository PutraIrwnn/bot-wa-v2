# ADR 0012: Single Source of Time (The World's Heartbeat)

## 1. Masalah apa yang diselesaikan?
Bila berbagai engine (WeatherEngine, BehaviorEngine, StoryEngine, dll) diizinkan mempublikasikan event waktu (`world.tick`) secara independen, maka konsep waktu di Aetheria akan terfragmentasi. Satu *bug* pada timer di `NPCEngine` dapat membuat waktu berdetak 100x lebih cepat daripada *engine* cuaca.

## 2. Keputusan
**Time is the heartbeat of the world, and WorldEngine is its only heart.**
- Ditetapkan secara mutlak: Hanya `WorldEngine` yang memiliki otorisasi untuk me-release (*publish*) event `world.tick`.
- Seluruh entitas dan subsistem *Engine* lain wajib bersifat murni reaktif (*subscribe*) terhadap waktu.
- Larangan keras terhadap penggunaan `setInterval`, `setTimeout`, atau implementasi *Clock* buatan sendiri di dalam komponen *Domain* lain.

Keputusan ini memusatkan pengurusan "perjalanan waktu", memudahkan pengujian (mempercepat simulasi hari/tahun), dan mencegah disinkronisasi status ekosistem game.
