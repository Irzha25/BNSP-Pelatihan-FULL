import { Router } from "express";
import { pool, withTransaction } from "../db";
import { writeActivityLog } from "../services/activityLog";
import { type FieldRules, normalizeBody, validateBody } from "../utils/fields";
import { buildSetClause } from "../utils/sql";
import {
  isObjectBody, parseId, validAngkatan, validGender, validOptionalEmail, validRequiredText,
} from "../utils/validators";

const router = Router();

const COLUMNS = "id, nim, nama, prodi, angkatan, email, jenis_kelamin, created_at";

const trimmed = (value: unknown) => (value as string).trim();
const textOrNull = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

const FIELDS: FieldRules = {
  nim: { valid: (v) => validRequiredText(v, 20), message: "NIM wajib berupa teks dan maksimal 20 karakter", normalize: trimmed },
  nama: { valid: (v) => validRequiredText(v, 100), message: "Nama wajib berupa teks dan maksimal 100 karakter", normalize: trimmed },
  prodi: { valid: (v) => validRequiredText(v, 60), message: "Program studi wajib berupa teks dan maksimal 60 karakter", normalize: trimmed },
  angkatan: { valid: validAngkatan, message: "Angkatan harus berupa tahun yang valid" },
  email: { valid: validOptionalEmail, message: "Format email tidak valid", normalize: textOrNull },
  jenis_kelamin: { valid: validGender, message: "Jenis kelamin harus Laki-laki atau Perempuan", normalize: textOrNull },
};
const REQUIRED_FIELDS = ["nim", "nama", "prodi", "angkatan"];
const OPTIONAL_FIELDS = ["email", "jenis_kelamin"];

type StudentRow = {
  id: number; nim: string; nama: string; prodi: string; angkatan: number;
  email: string | null; jenis_kelamin: string | null;
};

const logDetail = (s: StudentRow) => ({
  prodi: s.prodi, angkatan: s.angkatan, email: s.email, jenis_kelamin: s.jenis_kelamin,
});

// GET semua mahasiswa; mendukung pencarian nama/NIM melalui ?q=...
router.get("/", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM public.mahasiswa
     WHERE nim ILIKE $1 OR nama ILIKE $1
     ORDER BY id`,
    [`%${q}%`]
  );
  res.json(rows);
});

// GET satu mahasiswa.
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ message: "ID tidak valid" });
    return;
  }
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM public.mahasiswa WHERE id = $1`, [id]);
  if (!rows[0]) {
    res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    return;
  }
  res.json(rows[0]);
});

// POST mahasiswa + catatan aktivitas dalam satu transaksi.
router.post("/", async (req, res) => {
  const body = req.body;
  if (!isObjectBody(body)) {
    res.status(400).json({ message: "Body harus berupa JSON object" });
    return;
  }
  if (!REQUIRED_FIELDS.every((field) => FIELDS[field].valid(body[field]))) {
    res.status(400).json({ message: "NIM, nama, program studi, dan angkatan wajib diisi dengan benar" });
    return;
  }
  const invalidOptional = OPTIONAL_FIELDS.find((field) => !FIELDS[field].valid(body[field]));
  if (invalidOptional) {
    res.status(400).json({ message: FIELDS[invalidOptional].message });
    return;
  }

  const v = normalizeBody(body, FIELDS, Object.keys(FIELDS));
  const student = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO public.mahasiswa (nim, nama, prodi, angkatan, email, jenis_kelamin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLUMNS}`,
      [v.nim, v.nama, v.prodi, v.angkatan, v.email, v.jenis_kelamin]
    );
    await writeActivityLog(client, "CREATE", rows[0], logDetail(rows[0]));
    return rows[0];
  });
  res.status(201).json({ message: "Mahasiswa berhasil ditambahkan", data: student });
});

// PATCH mahasiswa; hanya field yang dikirim yang diubah.
router.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ message: "ID tidak valid" });
    return;
  }
  const body = req.body;
  if (!isObjectBody(body)) {
    res.status(400).json({ message: "Body harus berupa JSON object" });
    return;
  }
  const error = validateBody(body, FIELDS, "Kirim minimal satu field yang valid untuk diubah");
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const { sets, values } = buildSetClause(normalizeBody(body, FIELDS, Object.keys(body)));
  values.push(id);
  const student = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE public.mahasiswa SET ${sets.join(", ")}
       WHERE id = $${values.length}
       RETURNING ${COLUMNS}`,
      values
    );
    if (!rows[0]) return null;
    await writeActivityLog(client, "UPDATE", rows[0], logDetail(rows[0]));
    return rows[0];
  });
  if (!student) {
    res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    return;
  }
  res.json({ message: "Data mahasiswa berhasil diperbarui", data: student });
});

// DELETE mahasiswa secara permanen; aktivitas tercatat sebelum transaksi diselesaikan.
router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ message: "ID tidak valid" });
    return;
  }
  try {
    const student = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `DELETE FROM public.mahasiswa WHERE id = $1 RETURNING ${COLUMNS}`,
        [id]
      );
      if (!rows[0]) return null;
      await writeActivityLog(client, "DELETE", rows[0], logDetail(rows[0]));
      return rows[0];
    });
    if (!student) {
      res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
      return;
    }
    res.json({ message: "Mahasiswa berhasil dihapus" });
  } catch (error) {
    // 23503 = masih dirujuk tabel users lewat id_mhs
    if ((error as { code?: string }).code === "23503") {
      res.status(409).json({ message: "Mahasiswa masih terhubung dengan data user. Hapus user terkait terlebih dahulu" });
      return;
    }
    throw error;
  }
});

export default router;
