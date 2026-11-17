/**
 * Membuat potongan "kolom = $n" untuk UPDATE.
 * Nama kolom HANYA boleh berasal dari daftar field tetap di kode, bukan dari input user.
 */
export function buildSetClause(fields: Record<string, unknown>) {
  const entries = Object.entries(fields);
  return {
    sets: entries.map(([column], index) => `${column} = $${index + 1}`),
    values: entries.map(([, value]) => value) as unknown[],
  };
}
