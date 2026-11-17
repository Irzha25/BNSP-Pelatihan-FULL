import { useMemo, useState, type FormEvent } from "react";
import { apiRequest, errorMessage } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import PageHeading from "../components/PageHeading";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { formatDate, initials } from "../format";
import { usePagination } from "../hooks/usePagination";
import type { ListState, Mahasiswa, MutationResult, ShowToast, UserRow } from "../types";

const PAGE_SIZE = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = { id_mhs: string; email: string; password: string };
const emptyForm = (): FormState => ({ id_mhs: "", email: "", password: "" });

/** Mengembalikan pesan kesalahan pertama, atau null jika form valid. */
function validateForm(form: FormState, isEditing: boolean): string | null {
  if (!form.id_mhs) return "Pilih mahasiswa terlebih dahulu.";
  if (!EMAIL_PATTERN.test(form.email.trim())) return "Format email belum benar.";
  if (!isEditing && form.password.length < 8) return "Password user baru minimal 8 karakter.";
  if (form.password && form.password.length < 8) return "Password baru minimal 8 karakter.";
  return null;
}

type Props = {
  users: ListState<UserRow>;
  students: ListState<Mahasiswa>;
  showToast: ShowToast;
};

export default function UsersPage({ users, students, showToast }: Props) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users.items;
    return users.items.filter(
      (u) =>
        u.email.toLowerCase().includes(keyword) ||
        u.mahasiswa_nama.toLowerCase().includes(keyword) ||
        u.nim.toLowerCase().includes(keyword)
    );
  }, [users.items, query]);
  const { page, setPage, pageItems } = usePagination(filtered, PAGE_SIZE);
  const noStudents = !students.loading && students.items.length === 0;

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm(), id_mhs: students.items[0] ? String(students.items[0].id) : "" });
    setModalOpen(true);
  }

  function openEdit(user: UserRow) {
    setEditing(user);
    setForm({ id_mhs: String(user.id_mhs), email: user.email, password: "" });
    setModalOpen(true);
  }

  function resetModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
  }

  function closeModal() {
    if (!saving) resetModal();
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateForm(form, Boolean(editing));
    if (problem) {
      showToast(problem, "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = { id_mhs: Number(form.id_mhs), email: form.email.trim() };
      if (form.password) payload.password = form.password;
      await apiRequest<MutationResult<UserRow>>(editing ? `/users/${editing.uuid}` : "/users", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      resetModal();
      await users.reload();
      showToast(editing ? "Data user berhasil diperbarui." : "User berhasil ditambahkan.");
    } catch (err) {
      showToast(errorMessage(err, "User gagal disimpan."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/users/${deleteTarget.uuid}`, { method: "DELETE" });
      const { email } = deleteTarget;
      setDeleteTarget(null);
      await users.reload();
      showToast(`User ${email} berhasil dihapus.`);
    } catch (err) {
      showToast(errorMessage(err, "User gagal dihapus."), "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="PENGELOLAAN AKUN"
        title="Data User"
        description="Akun user terhubung dengan data mahasiswa melalui kolom id_mhs."
        actionLabel="Tambah User"
        onAction={openCreate}
        actionDisabled={noStudents || students.loading}
      />
      {users.error && <ErrorBanner message={users.error} onRetry={() => void users.reload()} />}
      {noStudents && (
        <div className="error-banner" role="status">
          <span>ℹ</span>
          <div>
            <strong>Belum ada data mahasiswa</strong>
            <p>Tambahkan mahasiswa di menu Data Mahasiswa dulu, supaya user bisa dikaitkan lewat id_mhs.</p>
          </div>
          <a className="retry-button" href="#mahasiswa">Buka Data Mahasiswa</a>
        </div>
      )}

      <section className="data-panel">
        <div className="panel-heading">
          <div>
            <h2>Daftar User</h2>
            <p>Password disimpan sebagai hash dan tidak pernah ditampilkan.</p>
          </div>
          <div className="record-pill">{filtered.length} user</div>
        </div>

        <SearchBar
          value={query}
          placeholder="Cari email, nama, atau NIM..."
          onChange={changeQuery}
          onRefresh={() => void users.reload()}
        />

        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>MAHASISWA</th>
                <th>DIBUAT</th>
                <th>DIUBAH</th>
                <th className="action-heading">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {users.loading ? (
                <tr><td colSpan={5} className="table-message"><span className="spinner" /> Memuat data user...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <div className="empty-icon">☺</div>
                    <strong>{query ? "User tidak ditemukan" : "Belum ada user"}</strong>
                    <p>{query ? "Coba kata kunci yang lain." : "Klik “Tambah User” untuk membuat akun pertama."}</p>
                  </td>
                </tr>
              ) : (
                pageItems.map((user) => (
                  <tr key={user.uuid}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">{initials(user.mahasiswa_nama)}</div>
                        <div className="student-name-wrap">
                          <strong>{user.email}</strong>
                          <span title={user.uuid}>UUID {user.uuid.slice(0, 8)}…</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="student-name-wrap">
                        <strong>{user.mahasiswa_nama}</strong>
                        <span>NIM {user.nim} · id_mhs {user.id_mhs}</span>
                      </div>
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>{formatDate(user.updated_at)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button edit-button" onClick={() => openEdit(user)} aria-label={`Edit ${user.email}`} title="Edit user">✎</button>
                        <button className="icon-button delete-button" onClick={() => setDeleteTarget(user)} aria-label={`Hapus ${user.email}`} title="Hapus user">⌫</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="user" onChange={setPage} />
      </section>

      {modalOpen && (
        <Modal labelledBy="user-modal-title" onClose={closeModal}>
          <div className="modal-heading">
            <div>
              <div className="eyebrow">{editing ? "PERBARUI AKUN" : "AKUN BARU"}</div>
              <h2 id="user-modal-title">{editing ? "Edit User" : "Tambah User"}</h2>
              <p>{editing ? "Ubah data akun yang dipilih." : "Hubungkan akun dengan satu data mahasiswa."}</p>
            </div>
            <button className="modal-close" onClick={closeModal} aria-label="Tutup">×</button>
          </div>
          <form onSubmit={saveUser}>
            <div className="form-grid">
              <label className="field full-field">
                <span>Mahasiswa (id_mhs) <b>*</b></span>
                <select value={form.id_mhs} onChange={(e) => updateField("id_mhs", e.target.value)} required>
                  <option value="">Pilih mahasiswa</option>
                  {students.items.map((s) => (
                    <option key={s.id} value={s.id}>ID {s.id} — {s.nim} — {s.nama}</option>
                  ))}
                </select>
              </label>
              <label className="field full-field">
                <span>Email <b>*</b></span>
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="user@kampus.ac.id" maxLength={254} required />
              </label>
              <label className="field full-field">
                <span>Password {editing ? <small>(kosongkan jika tidak diubah)</small> : <b>*</b>}</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder={editing ? "Password baru (opsional)" : "Minimal 8 karakter"}
                  minLength={8}
                  maxLength={128}
                  required={!editing}
                  autoComplete="new-password"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>Batal</button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan User"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus user?"
          confirmLabel="Ya, hapus user"
          busyLabel="Menghapus..."
          busy={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        >
          Akun <strong>{deleteTarget.email}</strong> milik <strong>{deleteTarget.mahasiswa_nama}</strong> akan dihapus. Datanya tetap tersimpan di database untuk riwayat (soft delete).
        </ConfirmDialog>
      )}
    </>
  );
}
