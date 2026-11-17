
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
  uuid: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
    return;
  }

  const token = authorization.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "JWT_SECRET belum dikonfigurasi di backend.",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.uuid !== "string"
    ) {
      res.status(401).json({ message: "Token tidak valid." });
      return;
    }

    req.authUser = { uuid: payload.uuid };
    next();
  } catch {
    res.status(401).json({
      message: "Token tidak valid atau sudah kedaluwarsa.",
    });
  }
}
