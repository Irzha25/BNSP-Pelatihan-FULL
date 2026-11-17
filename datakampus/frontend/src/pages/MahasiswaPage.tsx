import { useMemo, useState, type FormEvent } from "react";
import { apiRequest, errorMessage } from "../api";
import ConfirmDialog from "../components/ConfirmDialog";
import ErrorBanner from "../components/ErrorBanner";
import Modal from "../components/Modal";
import PageHeading from "../components/PageHeading";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { initials } from "../format";
import { usePagination } from "../hooks/usePagination";
import type { ListState, Mahasiswa, MutationResult, ShowToast } from "../types";

const PAGE_SIZE = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  nim: string;
  nama: string;
  prodi: string;
  angkatan: string;
  email: string;
  jenis_kelamin: string;
};

const emptyForm = (): FormState => ({
  nim: "", nama: "", prodi: "", angkatan: String(new Date().getFullYear()), email: "", jenis_kelamin: "",
});

/** Mengembalikan pesan kesalahan pertama, atau null jika form valid. */
function validateForm(form: FormState, students: Mahasiswa[], editingId?: number): string | null {
  const year = Number(form.angkatan);
  const nim = form.nim.trim().toLowerCase();
  if (!form.nim.trim() || !form.nama.trim() || !form.prodi.trim()) return "NIM, nama, dan program studi wajib diisi.";
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 10) return "Tahun angkatan tidak valid.";
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) return "Format email belum benar.";
  if (form.jenis_kelamin !== "Laki-laki" && form.jenis_kelamin !== "Perempuan") return "Silakan pilih jenis kelamin.";
  if (students.some((s) => s.nim.trim().toLowerCase() === nim && s.id !== editingId)) {
    return "NIM tersebut sudah digunakan mahasiswa lain.";
  }
  return null;
}

type Props = {
  list: ListState<Mahasiswa>;
  showToast: ShowToast;
};

export default function MahasiswaPage({ list, showToast }: Props) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Mahasiswa | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Mahasiswa | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return list.items;
    return list.items.filter((s) => s.nama.toLowerCase().includes(keyword) || s.nim.toLowerCase().includes(keyword));
  }, [list.items, query]);
  const { page, setPage, pageItems } = usePagination(filtered, PAGE_SIZE);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(student: Mahasiswa) {
    setEditing(student);
    setForm({
      nim: student.nim,
      nama: student.nama,
      prodi: student.prodi,
      angkatan: String(student.angkatan),
      email: student.email ?? "",
      jenis_kelamin: student.jenis_kelamin ?? "",
    });
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

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = validateForm(form, list.items, editing?.id);
    if (problem) {
      showToast(problem, "error");
      return;
    }

    setSaving(true);
    try {
      const result = await apiRequest<MutationResult<Mahasiswa>>(
        editing ? `/mahasiswa/${editing.id}` : "/mahasiswa",
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            nim: form.nim.trim(),
            nama: form.nama.trim(),
            prodi: form.prodi.trim(),
            angkatan: Number(form.angkatan),
            email: form.email.trim() || null,
            jenis_kelamin: form.jenis_kelamin,
          }),
        }
      );
      resetModal();
      await list.reload();
      showToast(`${result.data.nama} berhasil ${editing ? "diperbarui" : "ditambahkan"}.`);
    } catch (err) {
      showToast(errorMessage(err, "Gagal menyimpan data."), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/mahasiswa/${deleteTarget.id}`, { method: "DELETE" });
      const { nama } = deleteTarget;
      setDeleteTarget(null);
      await list.reload();
      showToast(`Data ${nama} berhasil dihapus.`);
    } catch (err) {
      showToast(errorMessage(err, "Gagal menghapus data."), "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="PUSAT DATA AKADEMIK"
        title="Data Mahasiswa"
        description="Kelola informasi mahasiswa dalam satu tempat yang terorganisir."
        actionLabel="Tambah Mahasiswa"
        onAction={openCreate}
      />
      {list.error && <ErrorBanner message={list.error} onRetry={() => void list.reload()} />}

      <section className="data-panel">
        <div className="panel-heading">
          <div>
            <h2>Direktori Mahasiswa</h2>
            <p>Daftar mahasiswa yang tersimpan pada database.</p>
          </div>
          <div className="record-pill">{filtered.length} data</div>
        </div>

        <SearchBar
          value={query}
          placeholder="Cari nama atau NIM mahasiswa..."
          onChange={changeQuery}
          onRefresh={() => void list.reload()}
        />

        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>MAHASISWA</th>
                <th>NIM</th>
                <th>PROGRAM STUDI</th>
                <th>JENIS KELAMIN</th>
                <th>ANGKATAN</th>
                <th>EMAIL</th>
                <th className="action-heading">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {list.loading ? (
                <tr><td colSpan={7} className="table-message"><span className="spinner" /> Memuat data mahasiswa...</td></tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <div className="empty-icon">♙</div>
                    <strong>{query ? "Data tidak ditemukan" : "Belum ada data mahasiswa"}</strong>
                    <p>{query ? "Coba kata kunci nama atau NIM yang lain." : "Tambahkan mahasiswa pertama untuk memulai."}</p>
                    {!query && <button className="primary-button small" onClick={openCreate}>＋ Tambah Mahasiswa</button>}
                  </td>
                </tr>
              ) : (
                pageItems.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">{initials(student.nama)}</div>
                        <div className="student-name-wrap">
                          <strong>{student.nama}</strong>
                          <span>ID #{student.id}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="nim-text">{student.nim}</span></td>
                    <td><span className="program-chip">{student.prodi}</span></td>
                    <td>{student.jenis_kelamin || "—"}</td>
                    <td><span className="year-text">{student.angkatan}</span></td>
                    <td><span className="email-text">{student.email || "—"}</span></td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-button edit-button" onClick={() => openEdit(student)} aria-label={`Edit ${student.nama}`} title="Edit data">✎</button>
                        <button className="icon-button delete-button" onClick={() => setDeleteTarget(student)} aria-label={`Hapus ${student.nama}`} title="Hapus data">⌫</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} noun="mahasiswa" onChange={setPage} />
      </section>

      {modalOpen && (
        <Modal labelledBy="mahasiswa-modal-title" onClose={closeModal}>
          <div className="modal-heading">
            <div>
              <div className="eyebrow">{editing ? "PERBARUI INFORMASI" : "DATA AKADEMIK BARU"}</div>
              <h2 id="mahasiswa-modal-title">{editing ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>
              <p>{editing ? "Ubah informasi mahasiswa yang dipilih." : "Lengkapi formulir untuk menambahkan mahasiswa."}</p>
            </div>
            <button className="modal-close" onClick={closeModal} aria-label="Tutup">×</button>
          </div>
          <form onSubmit={saveStudent}>
            <div className="form-grid">
              <label className="field">
                <span>NIM <b>*</b></span>
                <input value={form.nim} onChange={(e) => updateField("nim", e.target.value)} placeholder="Contoh: 25250003" required maxLength={20} />
              </label>
              <label className="field">
                <span>Nama lengkap <b>*</b></span>
                <input value={form.nama} onChange={(e) => updateField("nama", e.target.value)} placeholder="Nama mahasiswa" required maxLength={100} />
              </label>
              <label className="field">
                <span>Program studi <b>*</b></span>
                <input value={form.prodi} onChange={(e) => updateField("prodi", e.target.value)} placeholder="Contoh: Sistem Informasi" required maxLength={60} />
              </label>
              <label className="field">
                <span>Jenis kelamin <b>*</b></span>
                <select value={form.jenis_kelamin} onChange={(e) => updateField("jenis_kelamin", e.target.value)} required>
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </label>
              <label className="field">
                <span>Tahun angkatan <b>*</b></span>
                <input type="number" min="1900" max="2100" value={form.angkatan} onChange={(e) => updateField("angkatan", e.target.value)} required />
              </label>
              <label className="field full-field">
                <span>Email <small>(opsional)</small></span>
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="nama@email.com" maxLength={100} />
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeModal} disabled={saving}>Batal</button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Mahasiswa"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus data mahasiswa?"
          confirmLabel="Ya, hapus data"
          busyLabel="Menghapus..."
          busy={deleting}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        >
          Data <strong>{deleteTarget.nama}</strong> dengan NIM <strong>{deleteTarget.nim}</strong> akan dihapus dari database. Tindakan ini tidak dapat dibatalkan.
        </ConfirmDialog>
      )}
    </>
  );
}
