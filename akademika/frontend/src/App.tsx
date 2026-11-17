
import { useState } from "react";
import type { FormEvent } from "react";
import DashboardHome from "./pages/DashboardHome";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Users,
} from "lucide-react";

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [role, setRole] = useState("mahasiswa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 function handleLogin(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!email.trim() || !password) {
    return;
  }

  // Simulasi login untuk mockup.
  // Belum memeriksa akun melalui backend.
  setShowDashboard(true);
}

  if (showDashboard) {
  return (
    <DashboardHome
      onLogout={() => setShowDashboard(false)}
    />
  );
}

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <GraduationCap size={34} />
          </div>

          <p className="brand-eyebrow">SISTEM INFORMASI AKADEMIK</p>
          <h1>SIAKAD<br />UNUSIA</h1>

          <p className="brand-description">
            Satu platform untuk mengelola aktivitas akademik
            secara mudah, terintegrasi, dan efisien.
          </p>

          <div className="brand-features">
            <div>
              <BookOpen size={20} />
              <span>Informasi akademik terpusat</span>
            </div>
            <div>
              <Users size={20} />
              <span>Akses sesuai peran pengguna</span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>Pengelolaan data terstruktur</span>
            </div>
          </div>
        </div>

        <p className="brand-footer">
          © 2026 SIAKAD UNUSIA · Sistem Informasi Akademik
        </p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-logo">
            <GraduationCap size={34} />
          </div>

          <p className="welcome-label">SELAMAT DATANG</p>
          <h2>Masuk ke akun Anda</h2>
          <p className="login-subtitle">
            Silakan masuk untuk melanjutkan ke portal akademik.
          </p>

          <form onSubmit={handleLogin}>
            <label className="field-label">Masuk sebagai</label>

            <div className="role-selector">
              <button
                type="button"
                className={role === "mahasiswa" ? "role-option active" : "role-option"}
                onClick={() => setRole("mahasiswa")}
              >
                <GraduationCap size={19} />
                Mahasiswa
              </button>

              <button
                type="button"
                className={role === "dosen" ? "role-option active" : "role-option"}
                onClick={() => setRole("dosen")}
              >
                <Users size={19} />
                Dosen
              </button>

              <button
                type="button"
                className={role === "admin" ? "role-option active" : "role-option"}
                onClick={() => setRole("admin")}
              >
                <ShieldCheck size={19} />
                Admin
              </button>
            </div>

            <label className="field-label" htmlFor="email">
              Email
            </label>
            <div className="input-wrapper">
              <Mail size={19} />
              <input
                id="email"
                type="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="password-label">
              <label className="field-label" htmlFor="password">
                Kata sandi
              </label>
            </div>

            <div className="input-wrapper">
              <LockKeyhole size={19} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Tampilkan atau sembunyikan kata sandi"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <button type="submit" className="login-button">
              Masuk ke portal
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="login-security">
            <ShieldCheck size={17} />
            <span>Akses portal akademik yang aman dan terstruktur.</span>
          </div>

          <p className="login-help">
            Mengalami kendala? Hubungi administrator kampus.
          </p>
        </div>
      </section>
    </main>
  );
}
