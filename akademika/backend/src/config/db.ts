// backend/src/config/db.ts
import { Pool } from 'pg';

// Konfigurasi koneksi ke PostgreSQL
const pool = new Pool({
    user: 'postgres',         // Sesuaikan jika username DBeaver Anda berbeda
    host: 'localhost',
    database: 'akademika_db', // Nama database sesuai di gambar DBeaver Anda
    password: 'IrzhaZ53',// Masukkan password PostgreSQL Anda di sini
    port: 5432,               // Port standar PostgreSQL
});

pool.connect((err) => {
    if (err) {
        console.error('Gagal terhubung ke database:', err.stack);
    } else {
        console.log('Berhasil terhubung ke database PostgreSQL (akademika_db)!');
    }
});

export default pool;