import type { PoolClient } from "pg";

export type StudentLog = { id: number; nim: string; nama: string };

export async function writeActivityLog(
  client: PoolClient,
  action: string,
  student: StudentLog | null,
  detail: Record<string, unknown> = {}
): Promise<void> {
  await client.query(
    `INSERT INTO public.activity_logs
      (action, mahasiswa_id, mahasiswa_nim, mahasiswa_nama, detail)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [action, student?.id ?? null, student?.nim ?? null, student?.nama ?? null, JSON.stringify(detail)]
  );
}
