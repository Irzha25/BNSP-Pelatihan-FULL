
import { useState } from "react";
import { GraduationCap, LockKeyhole, Mail } from "lucide-react";

type LoginProps = {
  onLogin: (role: string) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Mahasiswa");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    // Simulasi login untuk mockup.
    // Belum melakukan autentikasi ke backend.
    onLogin(role);
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2>SIAKAD</h2>
            <p>UNUSIA</p>
          </div>
        </div>

        <div className="login-message">
          <span className="eyebrow">ACADEMIC PORTAL</span>
          <h1>Kelola aktivitas akademik dalam satu tempat.</h1>
          <p>
            Platform informasi akademik untuk mahasiswa,
            dosen, dan administrator kampus.
          </p>
        </div>

        <div className="login-footer">
          SISTEM INFORMASI AKADEMIK
        </div>
      </section>

      <section className="login-form-section">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="mobile-brand">
            <GraduationCap size={34} />
            <span>SIAKAD UNUSIA</span>
          </div>

          <span className="eyebrow">SELAMAT DATANG</span>
          <h2>Masuk ke akun Anda</h2>
          <p className="muted">
            Silakan masuk untuk melanjutkan ke portal akademik.
          </p>

          <label htmlFor="role">Jenis akun</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Admin</option>
            <option>Dosen</option>
            <option>Mahasiswa</option>
          </select>

          <label htmlFor="email">Email</label>
          <div className="input-icon">
            <Mail size={18} />
            <input
              id="email"
              type="email"
              placeholder="nama@kampus.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-icon">
            <LockKeyhole size={18} />
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button login-button" type="submit">
            Masuk ke Dashboard
          </button>

          <p className="login-note">
            Portal Sistem Informasi Akademik UNUSIA
          </p>
        </form>
      </section>
    </main>
  );
}
