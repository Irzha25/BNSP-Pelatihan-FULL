import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { Pool } from "pg";

class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Koneksi ke database yang SAMA dengan yang dibuka di DBeaver
const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "akademika_db",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD,
});
pool.on("connect", (client) => {
  client.query("SET search_path TO akademika");
});

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

type Handler = (req: Request, res: Response) => Promise<void>;
const h = (fn: Handler) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res).catch(next);
const send = (res: Response, data: unknown, message = "Berhasil", extra: object = {}, status = 200) =>
  res.status(status).json({ success: true, message, data, ...extra });

const api = "/api/v1";

app.get(`${api}/health`, h(async (_req, res) => {
  await pool.query("SELECT 1");
  send(res, { status: "ok" }, "AKADEMIKA API berjalan");
}));

app.get(`${api}/stats`, h(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT (SELECT COUNT(*) FROM mahasiswa)::int   AS mahasiswa,
           (SELECT COUNT(*) FROM dosen)::int       AS dosen,
           (SELECT COUNT(*) FROM mata_kuliah)::int AS mata_kuliah,
           (SELECT COALESCE(ROUND(AVG(ipk), 2), 0) FROM v_ipk)::float AS rata_ipk`);
  send(res, rows[0], "Statistik akademik");
}));

app.get(`${api}/ipk`, h(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT nim, nama_mahasiswa, total_sks::int, ipk::float FROM v_ipk ORDER BY ipk DESC`);
  send(res, rows, "IPK mahasiswa");
}));

app.get(`${api}/mata-kuliah`, h(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id_mk, kode_mk, nama_mk, sks, semester_ke FROM mata_kuliah ORDER BY kode_mk`);
  send(res, rows, "Daftar mata kuliah");
}));

app.get(`${api}/jadwal`, h(async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT kl.id_kelas, mk.kode_mk, mk.nama_mk, mk.sks, d.nama_dosen, kl.hari,
           to_char(kl.jam_mulai, 'HH24:MI')   AS jam_mulai,
           to_char(kl.jam_selesai, 'HH24:MI') AS jam_selesai, kl.ruang
    FROM kelas kl
    JOIN mata_kuliah mk ON mk.id_mk = kl.id_mk
    JOIN dosen d        ON d.id_dosen = kl.id_dosen
    ORDER BY array_position(ARRAY['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'], kl.hari), kl.jam_mulai`);
  send(res, rows, "Jadwal kuliah");
}));

app.get(`${api}/mahasiswa`, h(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const q = `%${(req.query.search as string) ?? ""}%`;
  const where = "WHERE m.nama_mahasiswa ILIKE $1 OR m.nim ILIKE $1";
  const total = (await pool.query(`SELECT COUNT(*)::int AS n FROM mahasiswa m ${where}`, [q])).rows[0].n;
  const { rows } = await pool.query(
    `SELECT m.id_mahasiswa, m.nim, m.nama_mahasiswa, m.jenis_kelamin, m.angkatan, m.status,
            p.nama_prodi, i.ipk::float AS ipk, i.total_sks::int AS total_sks
     FROM mahasiswa m
     JOIN prodi p ON p.id_prodi = m.id_prodi
     LEFT JOIN v_ipk i ON i.nim = m.nim
     ${where} ORDER BY m.nim LIMIT $2 OFFSET $3`,
    [q, limit, (page - 1) * limit]);
  send(res, rows, "Daftar mahasiswa", {
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

app.get(`${api}/mahasiswa/:id`, h(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError(400, "ID tidak valid");
  const m = await pool.query(
    `SELECT m.*, p.nama_prodi FROM mahasiswa m
     JOIN prodi p ON p.id_prodi = m.id_prodi WHERE m.id_mahasiswa = $1`, [id]);
  if (!m.rowCount) throw new AppError(404, "Mahasiswa tidak ditemukan");
  const t = await pool.query(
    `SELECT kode_mk, nama_mk, sks, nilai_akhir::float, huruf, bobot::float
     FROM v_transkrip WHERE nim = $1 ORDER BY kode_mk`, [m.rows[0].nim]);
  send(res, { ...m.rows[0], transkrip: t.rows }, "Detail mahasiswa");
}));

app.post(`${api}/mahasiswa`, h(async (req, res) => {
  const { nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi, email, tanggal_lahir } = req.body ?? {};
  if (!nim || !nama_mahasiswa || !["L", "P"].includes(jenis_kelamin) || !angkatan || !id_prodi)
    throw new AppError(400, "nim, nama_mahasiswa, jenis_kelamin (L/P), angkatan, id_prodi wajib diisi");
  const { rows } = await pool.query(
    `INSERT INTO mahasiswa (nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi, email, tanggal_lahir)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi, email ?? null, tanggal_lahir ?? null]);
  send(res, rows[0], "Mahasiswa berhasil ditambahkan", {}, 201);
}));

app.delete(`${api}/mahasiswa/:id`, h(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new AppError(400, "ID tidak valid");
  const r = await pool.query("DELETE FROM mahasiswa WHERE id_mahasiswa = $1", [id]);
  if (!r.rowCount) throw new AppError(404, "Mahasiswa tidak ditemukan");
  send(res, null, "Mahasiswa dihapus");
}));

app.use((_req, _res, next) => next(new AppError(404, "Endpoint tidak ditemukan")));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  let status = err.status ?? 500;
  let message = err.message;
  if (err.code === "23505") { status = 409; message = "Data sudah ada (NIM/email duplikat)"; }
  else if (err.code === "23503") { status = 409; message = "Data masih terkait data lain atau id_prodi tidak valid"; }
  else if (status === 500) { console.error(err); message = "Terjadi kesalahan pada server"; }
  res.status(status).json({ success: false, message });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`AKADEMIKA API jalan di http://localhost:${port}${api}`));
