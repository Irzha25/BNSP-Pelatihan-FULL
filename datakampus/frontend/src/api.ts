// VITE_API_URL (opsional) harus sudah memuat /api/v1, contoh: http://localhost:3000/api/v1
const API_BASE: string = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Permintaan gagal (${response.status})`);
  }
  return body as T;
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
