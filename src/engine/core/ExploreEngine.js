const DomainEvents = require('../core/DomainEvents');

class ExploreEngine {
    constructor(eventBus, npcEngine) {
        this.eventBus = eventBus;
        this.npcEngine = npcEngine;

        // Base Locations
        this.locations = {
            'alun_alun': {
                name: 'Alun-alun Kota',
                description: 'Pusat kegiatan Aetheria. Sebuah papan berita berdiri di tengah.',
                connections: ['toko_bunga', 'bengkel']
            },
            'toko_bunga': {
                name: 'Toko Bunga',
                description: 'Toko kecil yang penuh warna dan harum.',
                owner: 'rina',
                isOpen: true,
                statusText: 'Buka'
            }
        };

        this._registerListeners();
    }

    _registerListeners() {
        this.eventBus.subscribe(DomainEvents.DayPassed, this.updateLocations.bind(this));
    }

    /**
     * Memperbarui status lokasi (World Modifier)
     */
    updateLocations() {
        // Cek Toko Bunga Rina
        const rina = this.npcEngine.npcs['rina'];
        if (rina) {
            const toko = this.locations['toko_bunga'];
            
            // Jika memori 0 (Amnesia) atau mood sangat sedih, toko tutup
            if (rina.memory_health === 0) {
                toko.isOpen = false;
                toko.statusText = 'Tutup - Ada tanda tulisan tangan gemetar: "Aku tidak tahu cara merawat bunga."';
            } 
            // Jika jam tidur
            else if (rina.activity === 'tidur') {
                toko.isOpen = false;
                toko.statusText = 'Tutup - Rina sedang beristirahat.';
            } 
            else {
                toko.isOpen = true;
                toko.statusText = 'Buka';
            }
            console.log(`[ExploreEngine] Lokasi '${toko.name}' diupdate: ${toko.statusText}`);
        }
    }

    explore(locationId) {
        const loc = this.locations[locationId];
        if (!loc) return "Lokasi tidak diketahui.";

        // Publish event bahwa pemain mendatangi lokasi
        this.eventBus.publish(DomainEvents.PlayerArrived, {
            player: 'Putra', // Harusnya dari context
            location: locationId
        });

        if (!loc.isOpen) {
            return `Kamu berada di depan ${loc.name}.\nKondisi: ${loc.statusText}\n\nKamu tidak bisa masuk.`;
        }

        return `Kamu berada di ${loc.name}.\n${loc.description}\nKondisi: ${loc.statusText}\n\nKetik !talk ${loc.owner} untuk berinteraksi.`;
    }
}

module.exports = ExploreEngine;
