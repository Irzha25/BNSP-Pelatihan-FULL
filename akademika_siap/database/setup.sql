-- SIAKAD UNUSIA - setup database PostgreSQL
-- Jalankan di database akademika_db melalui DBeaver.
-- PERINGATAN: menghapus seluruh schema akademika beserta isinya.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
DROP SCHEMA IF EXISTS akademika CASCADE;
CREATE SCHEMA akademika;
SET search_path TO akademika, public;

CREATE TABLE prodi (
  id_prodi SERIAL PRIMARY KEY,
  kode_prodi VARCHAR(10) UNIQUE NOT NULL,
  nama_prodi VARCHAR(100) NOT NULL,
  jenjang VARCHAR(5) NOT NULL DEFAULT 'S1',
  fakultas VARCHAR(100) NOT NULL
);
CREATE TABLE dosen (
  id_dosen SERIAL PRIMARY KEY,
  nidn VARCHAR(15) UNIQUE NOT NULL,
  nama_dosen VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  id_prodi INT NOT NULL REFERENCES prodi(id_prodi)
);
CREATE TABLE mahasiswa (
  id_mahasiswa SERIAL PRIMARY KEY,
  nim VARCHAR(15) UNIQUE NOT NULL,
  nama_mahasiswa VARCHAR(100) NOT NULL,
  jenis_kelamin CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L','P')),
  tanggal_lahir DATE,
  angkatan INT NOT NULL,
  email VARCHAR(100) UNIQUE,
  id_prodi INT NOT NULL REFERENCES prodi(id_prodi),
  status VARCHAR(10) NOT NULL DEFAULT 'Aktif'
    CHECK (status IN ('Aktif','Cuti','Lulus','Nonaktif'))
);
CREATE TABLE mata_kuliah (
  id_mk SERIAL PRIMARY KEY,
  kode_mk VARCHAR(10) UNIQUE NOT NULL,
  nama_mk VARCHAR(100) NOT NULL,
  sks SMALLINT NOT NULL CHECK (sks BETWEEN 1 AND 6),
  semester_ke SMALLINT NOT NULL,
  id_prodi INT NOT NULL REFERENCES prodi(id_prodi)
);
CREATE TABLE tahun_akademik (
  id_ta SERIAL PRIMARY KEY,
  tahun VARCHAR(9) NOT NULL,
  semester VARCHAR(6) NOT NULL CHECK (semester IN ('Ganjil','Genap')),
  aktif BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (tahun, semester)
);
CREATE TABLE kelas (
  id_kelas SERIAL PRIMARY KEY,
  id_mk INT NOT NULL REFERENCES mata_kuliah(id_mk),
  id_dosen INT NOT NULL REFERENCES dosen(id_dosen),
  id_ta INT NOT NULL REFERENCES tahun_akademik(id_ta),
  nama_kelas VARCHAR(5) NOT NULL,
  hari VARCHAR(10) NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  ruang VARCHAR(20),
  CHECK (jam_selesai > jam_mulai)
);
CREATE TABLE krs (
  id_krs SERIAL PRIMARY KEY,
  id_mahasiswa INT NOT NULL REFERENCES mahasiswa(id_mahasiswa),
  id_kelas INT NOT NULL REFERENCES kelas(id_kelas),
  tanggal_ambil DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (id_mahasiswa, id_kelas)
);
CREATE TABLE nilai (
  id_krs INT PRIMARY KEY REFERENCES krs(id_krs) ON DELETE CASCADE,
  nilai_tugas NUMERIC(5,2) NOT NULL CHECK (nilai_tugas BETWEEN 0 AND 100),
  nilai_uts NUMERIC(5,2) NOT NULL CHECK (nilai_uts BETWEEN 0 AND 100),
  nilai_uas NUMERIC(5,2) NOT NULL CHECK (nilai_uas BETWEEN 0 AND 100),
  nilai_akhir NUMERIC(5,2) GENERATED ALWAYS AS
    (ROUND(nilai_tugas * 0.3 + nilai_uts * 0.3 + nilai_uas * 0.4, 2)) STORED
);
CREATE TABLE pengguna (
  id_pengguna SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  peran VARCHAR(20) NOT NULL CHECK (peran IN ('admin','dosen','mahasiswa')),
  id_dosen INT UNIQUE REFERENCES dosen(id_dosen) ON DELETE SET NULL,
  id_mahasiswa INT UNIQUE REFERENCES mahasiswa(id_mahasiswa) ON DELETE SET NULL,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (peran = 'admin' AND id_dosen IS NULL AND id_mahasiswa IS NULL) OR
    (peran = 'dosen' AND id_dosen IS NOT NULL AND id_mahasiswa IS NULL) OR
    (peran = 'mahasiswa' AND id_mahasiswa IS NOT NULL AND id_dosen IS NULL)
  )
);
CREATE INDEX idx_mahasiswa_prodi ON mahasiswa(id_prodi);
CREATE INDEX idx_krs_mahasiswa ON krs(id_mahasiswa);
CREATE INDEX idx_krs_kelas ON krs(id_kelas);

INSERT INTO prodi (kode_prodi,nama_prodi,jenjang,fakultas) VALUES
('SI','Sistem Informasi','S1','Fakultas Teknik dan Ilmu Komputer'),
('TI','Teknik Informatika','S1','Fakultas Teknik dan Ilmu Komputer'),
('TIN','Teknik Industri','S1','Fakultas Teknik dan Ilmu Komputer');

INSERT INTO dosen (nidn,nama_dosen,email,id_prodi) VALUES
('0401018801','Dr. Ahmad Fauzi, M.Kom.','ahmad.fauzi@kampus.ac.id',1),
('0412058702','Siti Nurhaliza, M.T.','siti.nurhaliza@kampus.ac.id',1),
('0320099003','Budi Santoso, M.Cs.','budi.santoso@kampus.ac.id',1),
('0225078904','Rina Marlina, M.Stat.','rina.marlina@kampus.ac.id',2);

INSERT INTO mahasiswa (nim,nama_mahasiswa,jenis_kelamin,tanggal_lahir,angkatan,email,id_prodi) VALUES
('25250101','Rizky Maulana','L','2006-03-14',2025,'rizky.m@mhs.ac.id',1),
('25250102','Aisyah Putri','P','2006-07-22',2025,'aisyah.p@mhs.ac.id',1),
('25250103','Dimas Pratama','L','2005-11-05',2025,'dimas.p@mhs.ac.id',1),
('25250104','Nabila Zahra','P','2006-01-30',2025,'nabila.z@mhs.ac.id',1),
('25250105','Fajar Nugroho','L','2006-09-18',2025,'fajar.n@mhs.ac.id',1),
('25250106','Laila Kamila','P','2005-12-09',2025,'laila.k@mhs.ac.id',1);

INSERT INTO mata_kuliah (kode_mk,nama_mk,sks,semester_ke,id_prodi) VALUES
('SI101','Algoritma dan Pemrograman',3,1,1),
('SI102','Basis Data',3,1,1),
('SI103','Pemrograman Web',3,1,1),
('SI104','Analisis dan Perancangan Sistem',3,1,1),
('SI105','Statistika Dasar',2,1,1);

INSERT INTO tahun_akademik (tahun,semester,aktif) VALUES
('2025/2026','Ganjil',TRUE),('2025/2026','Genap',FALSE);

INSERT INTO kelas (id_mk,id_dosen,id_ta,nama_kelas,hari,jam_mulai,jam_selesai,ruang) VALUES
(1,3,1,'A','Senin','08:00','10:30','Lab Komputer 1'),
(2,1,1,'A','Selasa','08:00','10:30','Lab Komputer 2'),
(3,2,1,'A','Rabu','13:00','15:30','Lab Komputer 1'),
(4,1,1,'A','Kamis','10:00','12:30','R. 203'),
(5,4,1,'A','Jumat','08:00','09:40','R. 105');

INSERT INTO krs (id_mahasiswa,id_kelas) VALUES
(1,1),(1,2),(1,3),(1,4),(2,1),(2,2),(2,3),(3,1),(3,2),(3,5),
(4,1),(4,3),(4,4),(5,2),(5,4),(5,5),(6,1),(6,3),(6,5);

INSERT INTO nilai (id_krs,nilai_tugas,nilai_uts,nilai_uas) VALUES
(1,90,85,88),(2,88,90,92),(3,85,80,86),(4,78,82,80),
(5,95,92,94),(6,90,88,91),(7,82,85,84),(8,70,65,72),
(9,75,70,68),(10,80,78,75),(11,85,88,90),(12,78,80,82),
(13,92,90,95),(14,65,60,62),(15,70,72,68),(16,76,74,78),
(17,88,84,86),(18,80,82,79),(19,90,91,93);

CREATE VIEW v_transkrip AS
SELECT m.nim,m.nama_mahasiswa,mk.kode_mk,mk.nama_mk,mk.sks,n.nilai_akhir,
 CASE WHEN n.nilai_akhir >= 85 THEN 'A' WHEN n.nilai_akhir >= 75 THEN 'B'
      WHEN n.nilai_akhir >= 65 THEN 'C' WHEN n.nilai_akhir >= 55 THEN 'D' ELSE 'E' END AS huruf,
 CASE WHEN n.nilai_akhir >= 85 THEN 4.00 WHEN n.nilai_akhir >= 75 THEN 3.00
      WHEN n.nilai_akhir >= 65 THEN 2.00 WHEN n.nilai_akhir >= 55 THEN 1.00 ELSE 0.00 END AS bobot,
 ta.tahun,ta.semester
FROM nilai n JOIN krs k ON k.id_krs=n.id_krs
JOIN mahasiswa m ON m.id_mahasiswa=k.id_mahasiswa
JOIN kelas kl ON kl.id_kelas=k.id_kelas
JOIN mata_kuliah mk ON mk.id_mk=kl.id_mk
JOIN tahun_akademik ta ON ta.id_ta=kl.id_ta;

CREATE VIEW v_ipk AS
SELECT nim,nama_mahasiswa,SUM(sks)::INT AS total_sks,
 ROUND(SUM(sks*bobot)/NULLIF(SUM(sks),0),2) AS ipk
FROM v_transkrip GROUP BY nim,nama_mahasiswa;

-- Akun demo; hash password disimpan, bukan plaintext.
INSERT INTO pengguna (nama,email,password_hash,peran) VALUES
('Administrator Akademik','admin@akademika.local',crypt('Admin123!',gen_salt('bf')),'admin');
INSERT INTO pengguna (nama,email,password_hash,peran,id_dosen) VALUES
('Siti Nurhaliza','dosen@akademika.local',crypt('Dosen123!',gen_salt('bf')),'dosen',2);
INSERT INTO pengguna (nama,email,password_hash,peran,id_mahasiswa) VALUES
('Rizky Maulana','mahasiswa@akademika.local',crypt('Mhs12345!',gen_salt('bf')),'mahasiswa',1);

RESET search_path;
