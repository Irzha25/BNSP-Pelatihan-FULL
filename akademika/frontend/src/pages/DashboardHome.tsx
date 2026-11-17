import Mahasiswa from "./Mahasiswa";
import { useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserRound,
  BookOpen,
  CalendarDays,
  ClipboardList,
  Award,
  Building2,
  Bell,
  Search,
  Menu,
  LogOut,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock3,
  Settings,
} from "lucide-react";

type DashboardHomeProps = {
  onLogout: () => void;
};

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Mahasiswa", icon: GraduationCap },
  { label: "Dosen", icon: Users },
  { label: "Program Studi", icon: Building2 },
  { label: "Mata Kuliah", icon: BookOpen },
  { label: "Tahun Akademik", icon: CalendarDays },
  { label: "Kelas", icon: ClipboardList },
  { label: "KRS", icon: BookOpen },
  { label: "Nilai", icon: Award },
];

const stats = [
  {
    label: "Total Mahasiswa",
    value: "6",
    note: "Data contoh database",
    icon: GraduationCap,
    color: "indigo",
  },
  {
    label: "Total Dosen",
    value: "4",
    note: "Data contoh database",
    icon: Users,
    color: "blue",
  },
  {
    label: "Program Studi",
    value: "3",
    note: "Program studi terdaftar",
    icon: Building2,
    color: "purple",
  },
  {
    label: "Mata Kuliah",
    value: "5",
    note: "Mata kuliah contoh",
    icon: BookOpen,
    color: "green",
  },
];

const students = [
  {
    nim: "25250101",
    name: "Rizky Maulana",
    prodi: "Sistem Informasi",
    status: "Aktif",
  },
  {
    nim: "25250102",
    name: "Aisyah Putri",
    prodi: "Sistem Informasi",
    status: "Aktif",
  },
  {
    nim: "25250103",
    name: "Dimas Pratama",
    prodi: "Sistem Informasi",
    status: "Aktif",
  },
  {
    nim: "25250104",
    name: "Nabila Zahra",
    prodi: "Sistem Informasi",
    status: "Aktif",
  },
];

export default function DashboardHome({
  onLogout,
}: DashboardHomeProps) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((student) =>
    `${student.nim} ${student.name} ${student.prodi}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Tutup menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <GraduationCap size={27} />
          </div>
          <div>
            <strong>SIAKAD</strong>
            <span>UNUSIA ACADEMIC</span>
          </div>
        </div>

        <div className="sidebar-caption">MENU UTAMA</div>

        <nav className="admin-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.label;

            return (
              <button
                key={item.label}
                className={`nav-item ${active ? "nav-active" : ""}`}
                onClick={() => {
                  setActiveMenu(item.label);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {active && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${activeMenu === "Pengaturan" ? "nav-active" : ""}`}
            onClick={() => {
              setActiveMenu("Pengaturan");
              setSidebarOpen(false);
            }}
          >
            <Settings size={19} />
            <span>Pengaturan</span>
          </button>

          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Admin SIAKAD</span>
            </div>
            <button
              className="logout-button"
              onClick={onLogout}
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="header-title">
                {activeMenu === "Dashboard"
                  ? "Dashboard"
                  : activeMenu}
              </div>
              <div className="header-breadcrumb">
                SIAKAD UNUSIA <ChevronRight size={13} />{" "}
                {activeMenu}
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="header-search">
              <Search size={17} />
              <input
                placeholder="Cari mahasiswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Cari mahasiswa"
              />
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Notifikasi"
              title="Notifikasi"
            >
              <Bell size={20} />
              <span />
            </button>
            <div className="header-avatar">A</div>
          </div>
        </header>

        <div className="admin-content">
          {activeMenu === "Dashboard" ? (
            <>
              <section className="welcome-banner">
                <div>
                  <div className="welcome-chip">
                    <span className="welcome-dot" />
                    PORTAL AKADEMIK
                  </div>
                  <h1>Selamat datang, Administrator!</h1>
                  <p>
                    Pantau dan kelola informasi akademik kampus
                    melalui satu dashboard.
                  </p>
                </div>
                <div className="welcome-art">
                  <GraduationCap size={94} strokeWidth={1.1} />
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>Ringkasan Akademik</h2>
                  <p>Gambaran umum data akademik kampus</p>
                </div>
                <span className="period-label">
                  <CalendarDays size={15} />
                  Tahun Akademik 2025/2026
                </span>
              </div>

              <section className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article className="stat-card" key={stat.label}>
                      <div className="stat-top">
                        <div className={`stat-icon ${stat.color}`}>
                          <Icon size={22} />
                        </div>
                        <ArrowUpRight
                          size={18}
                          className="stat-arrow"
                        />
                      </div>
                      <p>{stat.label}</p>
                      <h3>{stat.value}</h3>
                      <span>{stat.note}</span>
                    </article>
                  );
                })}
              </section>

              <section className="dashboard-grid">
                <article className="panel students-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Mahasiswa Terdaftar</h2>
                      <p>Contoh data mahasiswa</p>
                    </div>
                    <button
                      className="primary-small"
                      onClick={() => setActiveMenu("Mahasiswa")}
                    >
                      <Plus size={16} />
                      Kelola Data
                    </button>
                  </div>

                  <div className="table-scroll">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>NIM</th>
                          <th>Nama Mahasiswa</th>
                          <th>Program Studi</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.nim}>
                            <td>{student.nim}</td>
                            <td className="student-name">
                              {student.name}
                            </td>
                            <td>{student.prodi}</td>
                            <td>
                              <span className="status-active">
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan={4} className="empty-table">
                              Tidak ada mahasiswa yang cocok.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="panel-footer">
                    Data ini masih berupa contoh tampilan.
                    <button
                      className="text-button"
                      onClick={() => setActiveMenu("Mahasiswa")}
                    >
                      Lihat modul mahasiswa
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </article>

                <article className="panel quick-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Akses Cepat</h2>
                      <p>Pilih modul yang ingin dikelola</p>
                    </div>
                  </div>

                  {[
                    {
                      label: "Data Mahasiswa",
                      desc: "Identitas dan status mahasiswa",
                      icon: GraduationCap,
                      target: "Mahasiswa",
                    },
                    {
                      label: "Data Dosen",
                      desc: "Informasi dosen dan program studi",
                      icon: UserRound,
                      target: "Dosen",
                    },
                    {
                      label: "Kelas & KRS",
                      desc: "Jadwal kelas dan registrasi",
                      icon: ClipboardList,
                      target: "KRS",
                    },
                    {
                      label: "Pengelolaan Nilai",
                      desc: "Nilai tugas, UTS, dan UAS",
                      icon: Award,
                      target: "Nilai",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        className="quick-link"
                        onClick={() => setActiveMenu(item.target)}
                      >
                        <div className="quick-icon">
                          <Icon size={20} />
                        </div>
                        <div className="quick-text">
                          <strong>{item.label}</strong>
                          <span>{item.desc}</span>
                        </div>
                        <ChevronRight size={17} />
                      </button>
                    );
                  })}
                </article>
              </section>

              <footer className="admin-footer">
                <span>© 2026 SIAKAD UNUSIA</span>
                <span>
                  <Clock3 size={14} />
                  Sistem Informasi Akademik
                </span>
              </footer>
            </>
          ) : activeMenu === "Mahasiswa" ? (
            <Mahasiswa />
          ) : (
            <section className="module-placeholder">
              <div className="module-placeholder-icon">
                <BookOpen size={32} />
              </div>
              <p className="welcome-label">MODUL AKADEMIK</p>
              <h1>{activeMenu}</h1>
              <p>
                Halaman {activeMenu} sudah masuk ke navigasi.
                Selanjutnya kita akan membuat tabel, formulir
                tambah data, edit, hapus, pencarian, dan
                integrasi PostgreSQL untuk modul ini.
              </p>
              <button
                className="primary-small"
                onClick={() => setActiveMenu("Dashboard")}
              >
                Kembali ke Dashboard
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
