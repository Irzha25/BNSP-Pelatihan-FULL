import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "dev-only-change-this-secret-before-deploying";
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "akademika_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

type Role = "admin" | "dosen" | "mahasiswa";
type AuthRequest = Request & { user?: { id: number; email: string; role: Role; name: string } };
const asyncRoute = (fn: (req: AuthRequest, res: Response) => Promise<unknown>) =>
  (req: AuthRequest, res: Response, next: NextFunction) => { Promise.resolve(fn(req, res)).catch(next); };

const resources = {
  prodi: { table: "prodi", id: "id_prodi", label: "Program Studi", columns: ["kode_prodi","nama_prodi","jenjang","fakultas"], fields: [
    ["kode_prodi","Kode Prodi"],["nama_prodi","Nama Prodi"],["jenjang","Jenjang"],["fakultas","Fakultas"]] },
  dosen: { table: "dosen", id: "id_dosen", label: "Dosen", columns: ["nidn","nama_dosen","email","id_prodi"], fields: [
    ["nidn","NIDN"],["nama_dosen","Nama Dosen"],["email","Email"],["id_prodi","ID Prodi"]] },
  mahasiswa: { table: "mahasiswa", id: "id_mahasiswa", label: "Mahasiswa", columns: ["nim","nama_mahasiswa","jenis_kelamin","tanggal_lahir","angkatan","email","id_prodi","status"], fields: [
    ["nim","NIM"],["nama_mahasiswa","Nama Lengkap"],["jenis_kelamin","Jenis Kelamin"],["tanggal_lahir","Tanggal Lahir"],["angkatan","Angkatan"],["email","Email"],["id_prodi","ID Prodi"],["status","Status"]] },
  "mata-kuliah": { table: "mata_kuliah", id: "id_mk", label: "Mata Kuliah", columns: ["kode_mk","nama_mk","sks","semester_ke","id_prodi"], fields: [
    ["kode_mk","Kode MK"],["nama_mk","Nama Mata Kuliah"],["sks","SKS"],["semester_ke","Semester Ke"],["id_prodi","ID Prodi"]] },
  "tahun-akademik": { table: "tahun_akademik", id: "id_ta", label: "Tahun Akademik", columns: ["tahun","semester","aktif"], fields: [
    ["tahun","Tahun"],["semester","Semester"],["aktif","Aktif"]] },
  kelas: { table: "kelas", id: "id_kelas", label: "Kelas & Jadwal", columns: ["id_mk","id_dosen","id_ta","nama_kelas","hari","jam_mulai","jam_selesai","ruang"], fields: [
    ["id_mk","ID Mata Kuliah"],["id_dosen","ID Dosen"],["id_ta","ID Tahun Akademik"],["nama_kelas","Nama Kelas"],["hari","Hari"],["jam_mulai","Jam Mulai"],["jam_selesai","Jam Selesai"],["ruang","Ruang"]] },
  krs: { table: "krs", id: "id_krs", label: "KRS", columns: ["id_mahasiswa","id_kelas","tanggal_ambil"], fields: [
    ["id_mahasiswa","ID Mahasiswa"],["id_kelas","ID Kelas"],["tanggal_ambil","Tanggal Ambil"]] },
  nilai: { table: "nilai", id: "id_krs", label: "Nilai", columns: ["id_krs","nilai_tugas","nilai_uts","nilai_uas"], fields: [
    ["id_krs","ID KRS"],["nilai_tugas","Nilai Tugas"],["nilai_uts","Nilai UTS"],["nilai_uas","Nilai UAS"]] },
} as const;
type ResourceKey = keyof typeof resources;

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Silakan login terlebih dahulu." });
  try {
    req.user = jwt.verify(token, jwtSecret) as AuthRequest["user"];
    next();
  } catch { return res.status(401).json({ message: "Token tidak valid atau kedaluwarsa." }); }
}
function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Akses ini khusus administrator." });
  next();
}
function getResource(key: string) {
  return Object.prototype.hasOwnProperty.call(resources, key) ? resources[key as ResourceKey] : null;
}
app.get("/api/v1/health", asyncRoute(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", message: "API aktif dan PostgreSQL terhubung." });
}));
app.post("/api/v1/auth/login", asyncRoute(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email dan password wajib diisi." });
  const result = await pool.query(
    `SELECT id_pengguna,nama,email,password_hash,peran FROM akademika.pengguna WHERE lower(email)=lower($1)`,
    [String(email).trim()]);
  const user = result.rows[0];
  if (!user || !await bcrypt.compare(String(password), user.password_hash))
    return res.status(401).json({ message: "Email atau password salah." });
  const role = user.peran as Role;
  const payload = { id: user.id_pengguna, name: user.nama, email: user.email, role };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: "8h" });
  res.json({ token, user: payload });
}));
app.get("/api/v1/auth/me", authenticate, (req: AuthRequest, res) => res.json({ user: req.user }));

app.get("/api/v1/stats", authenticate, asyncRoute(async (_req, res) => {
  const q = await pool.query(`SELECT
    (SELECT COUNT(*)::int FROM akademika.mahasiswa) AS mahasiswa,
    (SELECT COUNT(*)::int FROM akademika.dosen) AS dosen,
    (SELECT COUNT(*)::int FROM akademika.mata_kuliah) AS mata_kuliah,
    (SELECT COUNT(*)::int FROM akademika.kelas) AS kelas,
    (SELECT COALESCE(ROUND(AVG(ipk),2),0)::float FROM akademika.v_ipk) AS rata_ipk`);
  res.json(q.rows[0]);
}));
app.get("/api/v1/ipk", authenticate, asyncRoute(async (_req, res) => {
  const q = await pool.query("SELECT * FROM akademika.v_ipk ORDER BY ipk DESC");
  res.json(q.rows);
}));
app.get("/api/v1/transkrip", authenticate, asyncRoute(async (req, res) => {
  const nim = String(req.query.nim || "");
  const q = nim
    ? await pool.query("SELECT * FROM akademika.v_transkrip WHERE nim=$1 ORDER BY kode_mk", [nim])
    : await pool.query("SELECT * FROM akademika.v_transkrip ORDER BY nim,kode_mk");
  res.json(q.rows);
}));
app.get("/api/v1/jadwal", authenticate, asyncRoute(async (_req, res) => {
  const q = await pool.query(`SELECT kl.id_kelas,mk.kode_mk,mk.nama_mk,mk.sks,d.nama_dosen,
    kl.nama_kelas,kl.hari,to_char(kl.jam_mulai,'HH24:MI') jam_mulai,
    to_char(kl.jam_selesai,'HH24:MI') jam_selesai,kl.ruang
    FROM akademika.kelas kl JOIN akademika.mata_kuliah mk ON mk.id_mk=kl.id_mk
    JOIN akademika.dosen d ON d.id_dosen=kl.id_dosen ORDER BY
    CASE kl.hari WHEN 'Senin' THEN 1 WHEN 'Selasa' THEN 2 WHEN 'Rabu' THEN 3
    WHEN 'Kamis' THEN 4 WHEN 'Jumat' THEN 5 WHEN 'Sabtu' THEN 6 ELSE 7 END,kl.jam_mulai`);
  res.json(q.rows);
}));

app.get("/api/v1/resources", authenticate, (_req, res) => {
  res.json(Object.entries(resources).map(([key, value]) => ({ key, label: value.label, fields: value.fields })));
});
app.get("/api/v1/:resource", authenticate, asyncRoute(async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ message: "Modul tidak ditemukan." });
  const q = await pool.query(`SELECT * FROM akademika."${resource.table}" ORDER BY "${resource.id}" DESC LIMIT 500`);
  res.json(q.rows);
}));
app.post("/api/v1/:resource", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ message: "Modul tidak ditemukan." });
  const columns = resource.columns.filter((c) => req.body?.[c] !== undefined);
  if (!columns.length) return res.status(400).json({ message: "Isi setidaknya satu field." });
  const values = columns.map((c) => req.body[c]);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  const q = await pool.query(
    `INSERT INTO akademika."${resource.table}" (${columns.map(c => `"${c}"`).join(",")}) VALUES (${placeholders.join(",")}) RETURNING *`,
    values);
  res.status(201).json(q.rows[0]);
}));
app.patch("/api/v1/:resource/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ message: "Modul tidak ditemukan." });
  const columns = resource.columns.filter((c) => req.body?.[c] !== undefined);
  if (!columns.length) return res.status(400).json({ message: "Tidak ada field untuk diperbarui." });
  const values = columns.map(c => req.body[c]);
  const sets = columns.map((c, i) => `"${c}"=$${i + 1}`);
  values.push(req.params.id);
  const q = await pool.query(`UPDATE akademika."${resource.table}" SET ${sets.join(",")} WHERE "${resource.id}"=$${values.length} RETURNING *`, values);
  if (!q.rowCount) return res.status(404).json({ message: "Data tidak ditemukan." });
  res.json(q.rows[0]);
}));
app.delete("/api/v1/:resource/:id", authenticate, adminOnly, asyncRoute(async (req, res) => {
  const resource = getResource(req.params.resource);
  if (!resource) return res.status(404).json({ message: "Modul tidak ditemukan." });
  const q = await pool.query(`DELETE FROM akademika."${resource.table}" WHERE "${resource.id}"=$1 RETURNING *`, [req.params.id]);
  if (!q.rowCount) return res.status(404).json({ message: "Data tidak ditemukan." });
  res.json({ message: "Data berhasil dihapus.", data: q.rows[0] });
}));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { code?: string; message?: string };
  if (e.code === "23505") return res.status(409).json({ message: "Data duplikat: kode, email, atau kombinasi tersebut sudah digunakan." });
  if (e.code === "23503") return res.status(400).json({ message: "Relasi tidak valid atau data masih digunakan oleh tabel lain." });
  if (e.code === "23514" || e.code === "22P02" || e.code === "22007") return res.status(400).json({ message: "Nilai tidak sesuai format atau aturan database." });
  console.error(err);
  res.status(500).json({ message: "Terjadi kesalahan server. Periksa terminal backend." });
});
pool.connect().then(c => { c.release(); console.log("PostgreSQL connected successfully"); })
  .catch(e => console.error("Gagal koneksi PostgreSQL:", e.message));
app.listen(port, () => console.log(`SIAKAD API berjalan di http://localhost:${port}`));
