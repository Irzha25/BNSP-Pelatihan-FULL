import { useMemo } from "react";
import ErrorBanner from "../components/ErrorBanner";
import PageHeading from "../components/PageHeading";
import StatCard from "../components/StatCard";
import { formatDate } from "../format";
import { useFetchList } from "../hooks/useFetchList";
import type { ActivityLog, ListState, Mahasiswa, UserRow } from "../types";

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Tambah mahasiswa",
  UPDATE: "Ubah mahasiswa",
  DELETE: "Hapus mahasiswa",
  USER_CREATE: "Tambah user",
  USER_UPDATE: "Ubah user",
  USER_DELETE: "Hapus user",
};

type Props = {
  mahasiswa: ListState<Mahasiswa>;
  users: ListState<UserRow>;
};

export default function DashboardPage({ mahasiswa, users }: Props) {
  const logs = useFetchList<ActivityLog>("/activity-logs?limit=5");
  const year = new Date().getFullYear();
  const students = mahasiswa.items;

  const programCount = useMemo(
    () => new Set(students.map((s) => s.prodi.trim()).filter(Boolean)).size,
    [students]
  );
  const newStudents = students.filter((s) => Number(s.angkatan) === year).length;
  const loading = mahasiswa.loading || users.loading;
  const error = mahasiswa.error || users.error;
  const show = (value: number) => (loading ? "—" : value);

  function retry() {
    void mahasiswa.reload();
    void users.reload();
    void logs.reload();
  }

  return (
    <>
      <PageHeading
        eyebrow="RINGKASAN"
        title="Dashboard"
        description="Gambaran singkat data akademik dan aktivitas terbaru."
      />
      {error && <ErrorBanner message={error} onRetry={retry} />}

      <section className="stats-grid" aria-label="Ringkasan data">
        <StatCard label="Total Mahasiswa" icon="♙" tone="blue" value={show(students.length)} foot="Mahasiswa tersimpan" />
        <StatCard label="Program Studi" icon="▤" tone="purple" value={show(programCount)} foot="Program studi berbeda" />
        <StatCard label={`Angkatan ${year}`} icon="✧" tone="green" value={show(newStudents)} foot="Mahasiswa angkatan tahun ini" />
        <StatCard label="User Aktif" icon="☺" tone="orange" value={show(users.items.length)} foot="Akun yang belum dihapus" />
      </section>

      <section className="data-panel">
        <div className="panel-heading">
          <div>
            <h2>Aktivitas Terbaru</h2>
            <p>Lima perubahan data terakhir yang tercatat di database.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr><th>WAKTU</th><th>AKTIVITAS</th><th>MAHASISWA</th></tr>
            </thead>
            <tbody>
              {logs.loading ? (
                <tr><td colSpan={3} className="table-message"><span className="spinner" /> Memuat aktivitas...</td></tr>
              ) : logs.items.length === 0 ? (
                <tr><td colSpan={3} className="table-message">Belum ada aktivitas.</td></tr>
              ) : (
                logs.items.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td><span className="program-chip">{ACTION_LABELS[log.action] ?? log.action}</span></td>
                    <td>
                      <div className="student-name-wrap">
                        <strong>{log.mahasiswa_nama ?? "—"}</strong>
                        <span>{log.mahasiswa_nim ? `NIM ${log.mahasiswa_nim}` : ""}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
