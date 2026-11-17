
import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import Topbar from "./components/Topbar";
import { useFetchList } from "./hooks/useFetchList";
import { useHashRoute, type Route } from "./hooks/useHashRoute";
import { useToast } from "./hooks/useToast";
import DashboardPage from "./pages/DashboardPage";
import MahasiswaPage from "./pages/MahasiswaPage";
import UsersPage from "./pages/UsersPage";
import Login from "./pages/Login";
import type { Mahasiswa, UserRow } from "./types";

const TITLES: Record<Route, string> = {
  dashboard: "Dashboard",
  mahasiswa: "Data Mahasiswa",
  users: "Data User",
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem("accessToken"))
  );

  const route = useHashRoute();
  const { toast, showToast, hideToast } = useToast();

  const mahasiswa = useFetchList<Mahasiswa>("/mahasiswa");
  const users = useFetchList<UserRow>("/users");
  const offline = Boolean(mahasiswa.error || users.error);

  function handleLoginSuccess() {
    setAuthenticated(true);
    window.location.hash = "/dashboard";
  }

  function handleLogout() {
    sessionStorage.removeItem("accessToken");
    setAuthenticated(false);
    window.location.hash = "/login";
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        route={route}
        counts={{
          mahasiswa: mahasiswa.items.length,
          users: users.items.length,
        }}
      />

      <main className="main-content">
        <Topbar title={TITLES[route]} offline={offline} />

        <div className="logout-area">
          <button type="button" onClick={handleLogout}>
            Keluar
          </button>
        </div>

        {route === "dashboard" && (
          <DashboardPage mahasiswa={mahasiswa} users={users} />
        )}

        {route === "mahasiswa" && (
          <MahasiswaPage list={mahasiswa} showToast={showToast} />
        )}

        {route === "users" && (
          <UsersPage
            users={users}
            students={mahasiswa}
            showToast={showToast}
          />
        )}

        <footer className="footer">
          <span>© {new Date().getFullYear()} EduData Academic Portal</span>
          <span>Dibuat untuk pengelolaan data akademik</span>
        </footer>
      </main>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}
