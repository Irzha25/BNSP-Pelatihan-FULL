# SIAKAD UNUSIA — Starter Project Terintegrasi

Starter project untuk belajar dan mengembangkan sistem informasi akademik menggunakan PostgreSQL, Express + TypeScript, React + Vite.

## Fitur yang disiapkan
- Login dengan peran `admin`, `dosen`, atau `mahasiswa` (JWT).
- Dashboard statistik.
- CRUD dasar untuk prodi, dosen, mahasiswa, mata kuliah, tahun akademik, kelas, KRS, dan nilai.
- Endpoint khusus IPK/transkrip dan jadwal.
- Frontend modern dengan sidebar, tabel, pencarian, tambah/edit/hapus.
- SQL setup selaras dengan skema `akademika`.

## Persyaratan
- Node.js versi LTS (disarankan 22 atau lebih baru)
- PostgreSQL 12+
- DBeaver (untuk menjalankan SQL dan memeriksa data)
- VS Code

## Instalasi dari awal
1. Ekstrak ZIP ke folder kerja, lalu buka folder `akademika_siap` di VS Code.
2. Buat database bernama `akademika_db` melalui DBeaver jika belum ada.
3. Buka koneksi `akademika_db` di DBeaver, buka `database/setup.sql`, lalu jalankan seluruh script.
   **Peringatan:** script ini menjalankan `DROP SCHEMA IF EXISTS akademika CASCADE` sehingga data lama pada schema `akademika` akan dihapus. Backup dulu jika ingin mempertahankan data.
4. Salin `backend/.env.example` menjadi `backend/.env`, lalu isi password PostgreSQL yang benar.
5. Terminal pertama:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
6. Terminal kedua:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
7. Buka URL Vite yang tampil, biasanya `http://localhost:5173`.

## Akun demo
SQL menambahkan akun contoh:
- Admin: `admin@akademika.local` / `Admin123!`
- Dosen: `dosen@akademika.local` / `Dosen123!`
- Mahasiswa: `mahasiswa@akademika.local` / `Mhs12345!`

Akun ini hanya untuk pengembangan lokal. Ganti password dan konfigurasi sebelum deployment. Hash dibuat PostgreSQL melalui `pgcrypto`.

## URL penting
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/v1/health`
- API prefix: `http://localhost:4000/api/v1`

## Catatan desain & keamanan
- Frontend tidak terhubung langsung ke PostgreSQL. Alurnya: React → Express API → PostgreSQL.
- DBeaver hanya klien untuk mengelola database, bukan server database.
- API CRUD menggunakan daftar tabel/kolom yang diizinkan (allowlist), bukan nama tabel bebas dari request.
- Login/JWT adalah fondasi awal. Untuk produksi perlu audit hak akses per data, validasi input yang lebih ketat, HTTPS, rate limit, reset password, dan pengujian keamanan.
- Role-based navigation di frontend membantu pengalaman pengguna, tetapi aturan otorisasi server perlu diperketat lagi sebelum digunakan sungguhan.
