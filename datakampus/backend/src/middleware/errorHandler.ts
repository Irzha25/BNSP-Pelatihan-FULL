import type { NextFunction, Request, Response } from "express";

// Endpoint yang tidak ada.
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
}

// Penanganan error umum PostgreSQL dan JSON.
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("API error:", err);
  if (err?.code === "23505") {
    res.status(409).json({ message: "Data duplikat: NIM atau email sudah terdaftar" });
    return;
  }
  if (err?.code === "23503") {
    res.status(400).json({ message: "Relasi tidak valid. Pastikan mahasiswa atau UUID user yang dirujuk tersedia" });
    return;
  }
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ message: "Format JSON tidak valid" });
    return;
  }
  res.status(500).json({ message: "Terjadi kesalahan pada server. Periksa terminal backend" });
}
