
import type { Request, Response } from "express";
import { pool } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "Email dan password wajib diisi",
      });
      return;
    }

    const { rows } = await pool.query(
      `SELECT uuid, email, password
       FROM public.users
       WHERE email = $1 AND deleted_at IS NULL
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({
        message: "Email atau password salah",
      });
      return;
    }

    // Password di database harus berupa hash bcrypt.
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      res.status(401).json({
        message: "Email atau password salah",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET belum dikonfigurasi");

      res.status(500).json({
        message: "Konfigurasi autentikasi server belum tersedia",
      });
      return;
    }

    const token = jwt.sign(
      {
        uuid: user.uuid,
        email: user.email,
      },
      secret,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}
