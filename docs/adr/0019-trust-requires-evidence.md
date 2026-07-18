# ADR 0019: Trust Changes Require Evidence

## 1. Konteks dan Masalah
Bila sistem sosial bereaksi murni berdasarkan kata-kata (persuasi/gosip), dunia Aetheria akan dipenuhi feedback loop. A menyebar hoaks ke B -> B percaya dan respek ke A -> B semakin gampang percaya pada A. Ini tidak realistis dan akan menghancurkan ekuilibrium sosial.

## 2. Keputusan
**Trust is earned by verified outcomes, not by persuasive words.**
- Tingkat **Trust** (Reputasi) antar-NPC TIDAK BOLEH berubah hanya karena mereka bertukar rumor atau mengobrol.
- **TrustManager** hanya berhak menambah (+2) atau mengurangi (-2) tingkat Trust apabila ada *Verified Evidence* (fakta yang disahkan dunia). 
- Contoh Evidence: `world.predictionCorrect` (Ternyata panen memang gagal seperti yang dikatakan Budi minggu lalu), atau `world.tradeSuccess` (Budi menepati janji dagang).
- `BeliefEngine` dilarang menulis ke parameter Trust. Ia hanya penilai persepsi, bukan penentu reputasi objektif.
