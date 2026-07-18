const fs = require('fs');
const path = require('path');
const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('🔄 Membaca file init_world.sql...');
        const sql = fs.readFileSync(path.join(__dirname, 'init_world.sql'), 'utf8');
        
        // Pisahkan query berdasarkan titik koma
        const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);
        
        console.log(`Menjalankan ${queries.length} query...`);
        for (const query of queries) {
            await db.query(query);
        }
        
        console.log('✅ Migrasi database Aetheria berhasil!');
    } catch (err) {
        console.error('❌ Gagal menjalankan migrasi:', err);
    } finally {
        process.exit();
    }
}

migrate();
