import { Router } from "express";
import type { Pool, PoolClient } from "pg";
import { pool, withTransaction } from "../db";
import { writeActivityLog } from "../services/activityLog";
import { type FieldRules, normalizeBody, validateBody } from "../utils/fields";
import { hashPassword } from "../utils/password";
import { buildSetClause } from "../utils/sql";
import { isObjectBody, validEmail, validId, validPassword, validUUID } from "../utils/validators";
import { registerUser } from '../controllers/users.controller';
import { loginUser } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";
// Password disimpan dalam bentuk hash scrypt dan tidak pernah dikirim ke frontend.
const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.use(authenticateToken);

const USER_SELECT = `
  SELECT u.uuid, u.id_mhs, u.email,
         u.created_at, u.created_by, u.updated_at, u.updated_by,
         u.deleted_at, u.deleted_by,
         m.nim, m.nama AS mahasiswa_nama, m.jenis_kelamin
  FROM public.users u
  LEFT JOIN public.mahasiswa m ON m.id = u.id_mhs`;

const isNullOrUUID = (value: unknown) => value === null || validUUID(value);

const FIELDS: FieldRules = {
  id_mhs: { valid: validId, message: "id_mhs harus berupa angka ID mahasiswa yang valid" },
  email: { valid: validEmail, message: "Email wajib valid", normalize: (v) => (v as string).trim().toLowerCase() },
  password: { valid: validPassword, message: "Password wajib 8–128 karakter", normalize: (v) => hashPassword(v as string) },
  updated_by: { valid: isNullOrUUID, message: "updated_by harus berupa UUID user atau null" },
};

async function fetchUser(db: Pool | PoolClient, uuid: string) {
  const { rows } = await db.query(`${USER_SELECT} WHERE u.uuid = $1`, [uuid]);
  return rows[0];
}

async function findStudent(client: PoolClient, id: number) {
  const { rows } = await client.query("SELECT id, nim, nama FROM public.mahasiswa WHERE id = $1", [id]);
  return rows[0] ?? null;
}

// GET daftar user aktif. Tambahkan ?include_deleted=true untuk melihat yang sudah di-soft-delete.
router.get("/", async (req, res) => {
  const includeDeleted = String(req.query.include_deleted ?? "") === "true";
  const where = includeDeleted ? "" : "WHERE u.deleted_at IS NULL";
  const { rows } = await pool.query(`${USER_SELECT} ${where} ORDER BY u.created_at DESC`);
  res.json(rows);
});

// GET satu user berdasarkan UUID.
router.get("/:uuid", async (req, res) => {
  const { uuid } = req.params;
  if (!validUUID(uuid)) {
    res.status(400).json({ message: "UUID user tidak valid" });
    return;
  }
  const { rows } = await pool.query(`${USER_SELECT} WHERE u.uuid = $1 AND u.deleted_at IS NULL`, [uuid]);
  if (!rows[0]) {
    res.status(404).json({ message: "User tidak ditemukan atau sudah dihapus" });
    return;
  }
  res.json(rows[0]);
});

// POST user baru. id_mhs wajib merujuk id mahasiswa yang benar-benar ada.
router.post("/", async (req, res) => {
  if (!isObjectBody(req.body)) {
    res.status(400).json({ message: "Body harus berupa JSON object" });
    return;
  }
  const { id_mhs, email, password, created_by } = req.body;
  if (!validId(id_mhs)) {
    res.status(400).json({ message: "id_mhs wajib berupa angka ID mahasiswa yang valid" });
    return;
  }
  if (!validEmail(email)) {
    res.status(400).json({ message: "Email wajib valid" });
    return;
  }
  if (!validPassword(password)) {
    res.status(400).json({ message: "Password wajib 8–128 karakter" });
    return;
  }
  if (created_by != null && !validUUID(created_by)) {
    res.status(400).json({ message: "created_by harus berupa UUID user atau null" });
    return;
  }

  const user = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO public.users (id_mhs, email, password, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING uuid, email`,
      [id_mhs, email.trim().toLowerCase(), hashPassword(password), created_by ?? null]
    );
    await writeActivityLog(client, "USER_CREATE", await findStudent(client, id_mhs), {
      user_uuid: rows[0].uuid, email: rows[0].email,
    });
    return fetchUser(client, rows[0].uuid);
  });
  res.status(201).json({ message: "User berhasil ditambahkan", data: user });
});

// PATCH user: dapat mengubah relasi mahasiswa, email, password, dan updated_by.
router.patch("/:uuid", async (req, res) => {
  const { uuid } = req.params;
  if (!validUUID(uuid)) {
    res.status(400).json({ message: "UUID user tidak valid" });
    return;
  }
  const body = req.body;
  if (!isObjectBody(body)) {
    res.status(400).json({ message: "Body harus berupa JSON object" });
    return;
  }
  const error = validateBody(body, FIELDS, "Kirim minimal satu field user yang valid");
  if (error) {
    res.status(400).json({ message: error });
    return;
  }

  const { sets, values } = buildSetClause(normalizeBody(body, FIELDS, Object.keys(body)));
  sets.push("updated_at = NOW()");
  values.push(uuid);
  const user = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE public.users SET ${sets.join(", ")}
       WHERE uuid = $${values.length} AND deleted_at IS NULL
       RETURNING uuid, id_mhs, email`,
      values
    );
    if (!rows[0]) return null;
    await writeActivityLog(client, "USER_UPDATE", await findStudent(client, rows[0].id_mhs), {
      user_uuid: rows[0].uuid, email: rows[0].email,
    });
    return fetchUser(client, uuid);
  });
  if (!user) {
    res.status(404).json({ message: "User tidak ditemukan atau sudah dihapus" });
    return;
  }
  res.json({ message: "User berhasil diperbarui", data: user });
});

// DELETE user memakai soft delete, agar catatan user dan audit trail tetap tersimpan.
router.delete("/:uuid", async (req, res) => {
  const { uuid } = req.params;
  if (!validUUID(uuid)) {
    res.status(400).json({ message: "UUID user tidak valid" });
    return;
  }
  const deletedBy = isObjectBody(req.body) ? req.body.deleted_by : undefined;
  if (deletedBy != null && !validUUID(deletedBy)) {
    res.status(400).json({ message: "deleted_by harus berupa UUID user atau null" });
    return;
  }

  const user = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE public.users SET deleted_at = NOW(), deleted_by = $2, updated_at = NOW()
       WHERE uuid = $1 AND deleted_at IS NULL
       RETURNING uuid, id_mhs, email`,
      [uuid, deletedBy ?? null]
    );
    if (!rows[0]) return null;
    await writeActivityLog(client, "USER_DELETE", await findStudent(client, rows[0].id_mhs), {
      user_uuid: rows[0].uuid, email: rows[0].email,
    });
    return rows[0];
  });
  if (!user) {
    res.status(404).json({ message: "User tidak ditemukan atau sudah dihapus" });
    return;
  }
  res.json({ message: "User berhasil dihapus (soft delete)" });
});

export default router;
