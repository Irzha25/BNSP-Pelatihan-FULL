import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

type StatusMahasiswa = "Aktif" | "Cuti" | "Lulus";

type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  email: string;
  angkatan: string;
  status: StatusMahasiswa;
};

type FormMahasiswa = Omit<Mahasiswa, "id">;

const dataAwal: Mahasiswa[] = [
  {
    id: 1,
    nim: "25250101",
    nama: "Rizky Maulana",
    prodi: "Sistem Informasi",
    email: "rizky@example.com",
    angkatan: "2025",
    status: "Aktif",
  },
  {
    id: 2,
    nim: "25250102",
    nama: "Aisyah Putri",
    prodi: "Sistem Informasi",
    email: "aisyah@example.com",
    angkatan: "2025",
    status: "Aktif",
  },
  {
    id: 3,
    nim: "25250103",
    nama: "Dimas Pratama",
    prodi: "Teknik Informatika",
    email: "dimas@example.com",
    angkatan: "2025",
    status: "Aktif",
  },
  {
    id: 4,
    nim: "25250104",
    nama: "Nabila Zahra",
    prodi: "Manajemen",
    email: "nabila@example.com",
    angkatan: "2025",
    status: "Cuti",
  },
  {
    id: 5,
    nim: "24240101",
    nama: "Ahmad Fadli",
    prodi: "Teknik Informatika",
    email: "ahmad@example.com",
    angkatan: "2024",
    status: "Aktif",
  },
];

const formKosong: FormMahasiswa = {
  nim: "",
  nama: "",
  prodi: "Sistem Informasi",
  email: "",
  angkatan: "2026",
  status: "Aktif",
};

const buttonStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "10px 13px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
} as const;

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: 9,
  fontSize: 14,
  outlineColor: "#4f46e5",
  background: "#fff",
  color: "#172033",
};

export default function Mahasiswa() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>(dataAwal);
  const [kataKunci, setKataKunci] = useState("");
  const [jumlahPerHalaman, setJumlahPerHalaman] = useState(5);
  const [halaman, setHalaman] = useState(1);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [idEdit, setIdEdit] = useState<number | null>(null);
  const [form, setForm] = useState<FormMahasiswa>(formKosong);
  const [pesan, setPesan] = useState("");
  const [idHapus, setIdHapus] = useState<number | null>(null);

  const hasilFilter = useMemo(() => {
    const query = kataKunci.trim().toLowerCase();

    return mahasiswa.filter((m) =>
      [m.nim, m.nama, m.prodi, m.email, m.status]
        .some((nilai) => nilai.toLowerCase().includes(query))
    );
  }, [mahasiswa, kataKunci]);

  const totalHalaman = Math.max(
    1,
    Math.ceil(hasilFilter.length / jumlahPerHalaman)
  );

  const halamanAktif = Math.min(halaman, totalHalaman);
  const awal = (halamanAktif - 1) * jumlahPerHalaman;
  const dataHalaman = hasilFilter.slice(
    awal,
    awal + jumlahPerHalaman
  );

  function bukaTambah() {
    setIdEdit(null);
    setForm(formKosong);
    setPesan("");
    setModalTerbuka(true);
  }

  function bukaEdit(m: Mahasiswa) {
    setIdEdit(m.id);
    setForm({
      nim: m.nim,
      nama: m.nama,
      prodi: m.prodi,
      email: m.email,
      angkatan: m.angkatan,
      status: m.status,
    });
    setPesan("");
    setModalTerbuka(true);
  }

  function simpanMahasiswa(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nim = form.nim.trim();
    const nama = form.nama.trim();
    const email = form.email.trim().toLowerCase();

    if (!nim || !nama || !email) {
      setPesan("NIM, nama, dan email wajib diisi.");
      return;
    }

    const nimDuplikat = mahasiswa.some(
      (m) => m.nim === nim && m.id !== idEdit
    );

    if (nimDuplikat) {
      setPesan("NIM tersebut sudah digunakan mahasiswa lain.");
      return;
    }

    const emailDuplikat = mahasiswa.some(
      (m) => m.email.toLowerCase() === email && m.id !== idEdit
    );

    if (emailDuplikat) {
      setPesan("Email tersebut sudah digunakan mahasiswa lain.");
      return;
    }

    const dataBaru: FormMahasiswa = {
      ...form,
      nim,
      nama,
      email,
    };

    if (idEdit !== null) {
      setMahasiswa((data) =>
        data.map((m) =>
          m.id === idEdit ? { ...dataBaru, id: idEdit } : m
        )
      );
      setPesan("Data mahasiswa berhasil diperbarui.");
    } else {
      const idBaru = Math.max(0, ...mahasiswa.map((m) => m.id)) + 1;

      setMahasiswa((data) => [
        ...data,
        { ...dataBaru, id: idBaru },
      ]);
      setPesan("Data mahasiswa berhasil ditambahkan.");
    }

    setModalTerbuka(false);
    setHalaman(1);
  }

  function hapusMahasiswa() {
    if (idHapus === null) return;

    setMahasiswa((data) => data.filter((m) => m.id !== idHapus));
    setIdHapus(null);
    setPesan("Data mahasiswa berhasil dihapus.");
  }

  function eksporCSV() {
    const header = [
      "NIM",
      "Nama",
      "Program Studi",
      "Email",
      "Angkatan",
      "Status",
    ];

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const baris = hasilFilter.map((m) =>
      [m.nim, m.nama, m.prodi, m.email, m.angkatan, m.status]
        .map(escapeCSV)
        .join(",")
    );

    const isi = [header.join(","), ...baris].join("\r\n");
    const blob = new Blob(["\uFEFF" + isi], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-mahasiswa.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 7,
    color: "#334155",
  } as const;

  return (
    <div style={{ color: "#172033", width: "100%", minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
            Dashboard / Mahasiswa
          </div>
          <h1 style={{ fontSize: 27, margin: 0, fontWeight: 750 }}>
            Data Mahasiswa
          </h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 14 }}>
            Kelola identitas dan status mahasiswa UNUSIA.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={eksporCSV}
            style={{
              ...buttonStyle,
              background: "#fff",
              color: "#334155",
            }}
          >
            <Download size={17} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={bukaTambah}
            style={{
              ...buttonStyle,
              background: "#4f46e5",
              color: "#fff",
              borderColor: "#4f46e5",
            }}
          >
            <Plus size={18} />
            Tambah Mahasiswa
          </button>
        </div>
      </div>

      {pesan && (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: "12px 15px",
            borderRadius: 9,
            background: "#eef2ff",
            color: "#3730a3",
            fontSize: 13,
          }}
        >
          {pesan}
          <button
            type="button"
            onClick={() => setPesan("")}
            aria-label="Tutup pesan"
            style={{
              float: "right",
              border: 0,
              background: "transparent",
              cursor: "pointer",
              color: "inherit",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 15,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total Mahasiswa",
            value: mahasiswa.length,
            icon: Users,
            color: "#eef2ff",
            foreground: "#4f46e5",
          },
          {
            label: "Mahasiswa Aktif",
            value: mahasiswa.filter((m) => m.status === "Aktif").length,
            icon: GraduationCap,
            color: "#dcfce7",
            foreground: "#15803d",
          },
          {
            label: "Mahasiswa Cuti",
            value: mahasiswa.filter((m) => m.status === "Cuti").length,
            icon: Users,
            color: "#fef3c7",
            foreground: "#b45309",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #e5eaf1",
                borderRadius: 14,
                padding: 19,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  {stat.label}
                </span>
                <span
                  style={{
                    background: stat.color,
                    color: stat.foreground,
                    borderRadius: 10,
                    padding: 9,
                    display: "inline-flex",
                  }}
                >
                  <Icon size={20} />
                </span>
              </div>
              <div style={{ fontSize: 29, fontWeight: 750 }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e5eaf1",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
            borderBottom: "1px solid #e5eaf1",
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, margin: "0 0 5px" }}>
              Daftar Mahasiswa
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
              {hasilFilter.length} data ditemukan
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              border: "1px solid #dbe2ea",
              borderRadius: 9,
              padding: "0 12px",
              width: 260,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <Search size={17} color="#94a3b8" />
            <input
              value={kataKunci}
              onChange={(e) => {
                setKataKunci(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari NIM, nama, prodi..."
              aria-label="Cari mahasiswa"
              style={{
                border: 0,
                outline: 0,
                padding: "11px 0",
                width: "100%",
                minWidth: 0,
                fontSize: 13,
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              whiteSpace: "nowrap",
              fontSize: 13,
            }}
          >
            <thead style={{ background: "#f8fafc", color: "#64748b" }}>
              <tr>
                {[
                  "NIM",
                  "NAMA MAHASISWA",
                  "PROGRAM STUDI",
                  "EMAIL",
                  "ANGKATAN",
                  "STATUS",
                  "AKSI",
                ].map((judul) => (
                  <th
                    key={judul}
                    style={{
                      padding: "14px 16px",
                      fontSize: 11,
                      letterSpacing: ".04em",
                      fontWeight: 700,
                      borderBottom: "1px solid #e5eaf1",
                    }}
                  >
                    {judul}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataHalaman.map((m) => (
                <tr key={m.id}>
                  <td style={cellStyle}>{m.nim}</td>
                  <td style={{ ...cellStyle, fontWeight: 650 }}>
                    {m.nama}
                  </td>
                  <td style={cellStyle}>{m.prodi}</td>
                  <td style={cellStyle}>{m.email}</td>
                  <td style={cellStyle}>{m.angkatan}</td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 650,
                        background:
                          m.status === "Aktif"
                            ? "#dcfce7"
                            : m.status === "Cuti"
                              ? "#fef3c7"
                              : "#e2e8f0",
                        color:
                          m.status === "Aktif"
                            ? "#166534"
                            : m.status === "Cuti"
                              ? "#92400e"
                              : "#334155",
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        type="button"
                        title="Edit mahasiswa"
                        aria-label={`Edit ${m.nama}`}
                        onClick={() => bukaEdit(m)}
                        style={{
                          ...actionButtonStyle,
                          color: "#4f46e5",
                          background: "#eef2ff",
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        title="Hapus mahasiswa"
                        aria-label={`Hapus ${m.nama}`}
                        onClick={() => setIdHapus(m.id)}
                        style={{
                          ...actionButtonStyle,
                          color: "#dc2626",
                          background: "#fef2f2",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {dataHalaman.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 35,
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    Tidak ada data mahasiswa yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: 17,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderTop: "1px solid #e5eaf1",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Tampilkan
            </span>
            <select
              value={jumlahPerHalaman}
              onChange={(e) => {
                setJumlahPerHalaman(Number(e.target.value));
                setHalaman(1);
              }}
              style={{
                ...inputStyle,
                width: 70,
                padding: "7px 8px",
                fontSize: 12,
              }}
              aria-label="Jumlah data per halaman"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              entri
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              disabled={halamanAktif <= 1}
              onClick={() => setHalaman((p) => Math.max(1, p - 1))}
              style={paginationButtonStyle(halamanAktif <= 1)}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 12, padding: "0 8px" }}>
              Halaman {halamanAktif} dari {totalHalaman}
            </span>
            <button
              type="button"
              disabled={halamanAktif >= totalHalaman}
              onClick={() =>
                setHalaman((p) => Math.min(totalHalaman, p + 1))
              }
              style={paginationButtonStyle(halamanAktif >= totalHalaman)}
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {modalTerbuka && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalTerbuka(false);
          }}
          style={modalOverlayStyle}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
            style={modalCardStyle}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <div>
                <h2 id="form-title" style={{ margin: 0, fontSize: 20 }}>
                  {idEdit === null ? "Tambah Mahasiswa" : "Edit Mahasiswa"}
                </h2>
                <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 13 }}>
                  Lengkapi informasi mahasiswa berikut.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalTerbuka(false)}
                aria-label="Tutup formulir"
                style={{
                  border: 0,
                  background: "#f1f5f9",
                  borderRadius: 8,
                  padding: 8,
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={simpanMahasiswa}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label htmlFor="nim" style={labelStyle}>NIM *</label>
                  <input
                    id="nim"
                    value={form.nim}
                    onChange={(e) =>
                      setForm({ ...form, nim: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="Contoh: 26260101"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="nama" style={labelStyle}>Nama lengkap *</label>
                  <input
                    id="nama"
                    value={form.nama}
                    onChange={(e) =>
                      setForm({ ...form, nama: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="prodi" style={labelStyle}>Program studi *</label>
                  <select
                    id="prodi"
                    value={form.prodi}
                    onChange={(e) =>
                      setForm({ ...form, prodi: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option>Sistem Informasi</option>
                    <option>Teknik Informatika</option>
                    <option>Manajemen</option>
                    <option>Teknik Elektro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="email-mhs" style={labelStyle}>Email *</label>
                  <input
                    id="email-mhs"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="nama@email.com"
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label htmlFor="angkatan" style={labelStyle}>Angkatan</label>
                    <select
                      id="angkatan"
                      value={form.angkatan}
                      onChange={(e) =>
                        setForm({ ...form, angkatan: e.target.value })
                      }
                      style={inputStyle}
                    >
                      {["2023", "2024", "2025", "2026"].map((tahun) => (
                        <option key={tahun}>{tahun}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" style={labelStyle}>Status</label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as StatusMahasiswa,
                        })
                      }
                      style={inputStyle}
                    >
                      <option>Aktif</option>
                      <option>Cuti</option>
                      <option>Lulus</option>
                    </select>
                  </div>
                </div>

                {pesan && (
                  <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                    {pesan}
                  </p>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 25,
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalTerbuka(false)}
                  style={{ ...buttonStyle, background: "#fff", color: "#334155" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: "#4f46e5",
                    borderColor: "#4f46e5",
                    color: "#fff",
                  }}
                >
                  {idEdit === null ? "Simpan Mahasiswa" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {idHapus !== null && (
        <div style={modalOverlayStyle}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            style={{ ...modalCardStyle, maxWidth: 420 }}
          >
            <h2 id="delete-title" style={{ fontSize: 19, marginTop: 0 }}>
              Hapus mahasiswa?
            </h2>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
              Data akan dihapus dari daftar mockup ini. Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIdHapus(null)}
                style={{ ...buttonStyle, background: "#fff", color: "#334155" }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={hapusMahasiswa}
                style={{
                  ...buttonStyle,
                  background: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#fff",
                }}
              >
                <Trash2 size={16} />
                Ya, hapus
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const cellStyle = {
  padding: "15px 16px",
  borderBottom: "1px solid #edf0f5",
  color: "#334155",
  verticalAlign: "middle" as const,
};

const actionButtonStyle = {
  border: 0,
  borderRadius: 7,
  padding: 8,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;

function paginationButtonStyle(disabled: boolean) {
  return {
    ...buttonStyle,
    padding: 7,
    background: disabled ? "#f8fafc" : "#fff",
    color: disabled ? "#cbd5e1" : "#334155",
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

const modalOverlayStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 1000,
  overflowY: "auto" as const,
};

const modalCardStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  width: "100%",
  maxWidth: 520,
  maxHeight: "90vh",
  overflowY: "auto" as const,
  boxSizing: "border-box" as const,
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.2)",
};