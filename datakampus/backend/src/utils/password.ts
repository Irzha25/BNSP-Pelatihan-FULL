import { randomBytes, scryptSync } from "node:crypto";

// Yang disimpan di kolom password adalah hash, bukan kata sandi asli.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}
