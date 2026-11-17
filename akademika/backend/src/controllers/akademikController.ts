import { Request, Response } from 'express';
import pool from '../config/db';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const mhs = await pool.query('SELECT COUNT(*) FROM mahasiswa');
    const dosen = await pool.query('SELECT COUNT(*) FROM dosen');
    const mk = await pool.query('SELECT COUNT(*) FROM mata_kuliah');
    const ipk = await pool.query('SELECT ROUND(AVG(ipk), 2) AS avg_ipk FROM v_ipk');

    res.json({
      total_mahasiswa: mhs.rows[0].count,
      total_dosen: dosen.rows[0].count,
      total_mk: mk.rows[0].count,
      rata_ipk: ipk.rows[0].avg_ipk || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getMahasiswa = async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT m.id_mahasiswa, m.nim, m.nama_mahasiswa, m.jenis_kelamin, m.angkatan, m.status, p.nama_prodi 
      FROM mahasiswa m 
      JOIN prodi p ON m.id_prodi = p.id_prodi 
      ORDER BY m.nim ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createMahasiswa = async (req: Request, res: Response) => {
  const { nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi, email } = req.body;
  try {
    const query = `
      INSERT INTO mahasiswa (nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi, email, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Aktif') RETURNING *
    `;
    const result = await pool.query(query, [nim, nama_mahasiswa, jenis_kelamin, angkatan, id_prodi || 1, email]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMahasiswa = async (req: Request, res: Response) => {
  const { nim } = req.params;
  const { nama_mahasiswa, jenis_kelamin, angkatan, status } = req.body;
  try {
    const query = `
      UPDATE mahasiswa 
      SET nama_mahasiswa = $1, jenis_kelamin = $2, angkatan = $3, status = $4 
      WHERE nim = $5 RETURNING *
    `;
    const result = await pool.query(query, [nama_mahasiswa, jenis_kelamin, angkatan, status, nim]);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMahasiswa = async (req: Request, res: Response) => {
  const { nim } = req.params;
  try {
    await pool.query('DELETE FROM mahasiswa WHERE nim = $1', [nim]);
    res.json({ message: 'Data mahasiswa berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};