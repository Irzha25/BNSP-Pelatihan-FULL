
import { useState, type FormEvent } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import "./login.css";

type LoginProps = {
  onLoginSuccess: () => void;
};

type LoginResponse = {
  message?: string;
  token?: string;
  user?: {
    uuid: string;
    email: string;
  };
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(true);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setIsError(true);
      setMessage("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const result: LoginResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            (response.status === 404
              ? "Endpoint login tidak ditemukan. Periksa route backend."
              : response.status === 401
                ? "Email atau password salah."
                : `Login gagal (HTTP ${response.status}).`)
        );
      }

      if (!result.token) {
        throw new Error("Server tidak mengirim token login.");
      }

      // Simpan token hanya setelah server menyatakan login berhasil.
      sessionStorage.setItem("accessToken", result.token);

      setIsError(false);
      setMessage("Login berhasil.");

      // Pindah ke dashboard melalui App.tsx.
      onLoginSuccess();
    } catch (error) {
      setIsError(true);

      if (error instanceof TypeError) {
        setMessage(
          "Tidak dapat terhubung ke server. Periksa backend dan konfigurasi CORS."
        );
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat login."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-brand">
          <div className="brand-icon">
            <GraduationCap size={30} />
          </div>
          <span>EduData</span>
        </div>

        <div className="visual-content">
          <span className="visual-label">
            SISTEM INFORMASI AKADEMIK
          </span>

          <h1>
            Satu langkah
            <br />
            menuju masa
            <br />
            depan <span>cerdas.</span>
          </h1>

          <p>
            Kelola informasi akademik dengan lebih mudah,
            terstruktur, dan efisien dalam satu platform.
          </p>

          <div className="visual-decoration">
            <div className="decoration-card">
              <GraduationCap size={23} />
              <div>
                <strong>EduData Akademik</strong>
                <small>Platform akademik terintegrasi</small>
              </div>
            </div>
          </div>
        </div>

        <p className="visual-footer">
          © {new Date().getFullYear()} EduData · Sistem Informasi Akademik
        </p>
      </section>

      <section className="login-form-side">
        <div className="login-form-container">
          <div className="mobile-brand">
            <GraduationCap size={28} />
            <strong>EduData</strong>
          </div>

          <div className="welcome-text">
            <span className="welcome-label">
              SELAMAT DATANG KEMBALI
            </span>

            <h2>Masuk ke akun Anda</h2>

            <p>
              Masukkan email dan password untuk melanjutkan.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Alamat email</label>

            <div className="login-input">
              <Mail size={19} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <label htmlFor="password">Password</label>

            <div className="login-input">
              <Lock size={19} />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                onClick={() => setShowPassword((previous) => !previous)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {message && (
              <div
                className="login-message"
                role={isError ? "alert" : "status"}
                style={
                  isError
                    ? undefined
                    : {
                        background: "#eaf8ef",
                        color: "#17683a",
                      }
                }
              >
                {message}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Memeriksa akun..." : "Masuk ke Dashboard"}

              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="login-note">
            <Lock size={15} />
            <span>
              Akses akun Anda dengan aman dan bertanggung jawab.
            </span>
          </div>

          <p className="login-bottom">
            Mengalami kendala? Hubungi administrator akademik.
          </p>
        </div>
      </section>
    </main>
  );
}
