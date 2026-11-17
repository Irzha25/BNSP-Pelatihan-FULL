import type { Route } from "../hooks/useHashRoute";

const MENU: { route: Route; label: string; icon: string }[] = [
  { route: "dashboard", label: "Dashboard", icon: "▦" },
  { route: "mahasiswa", label: "Data Mahasiswa", icon: "♙" },
  { route: "users", label: "Data User", icon: "☺" },
];

type Props = {
  route: Route;
  counts: Partial<Record<Route, number>>;
};

export default function Sidebar({ route, counts }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">E</div>
        <div>
          <div className="brand-name">EduData</div>
          <div className="brand-caption">ACADEMIC PORTAL</div>
        </div>
      </div>

      <div className="sidebar-label">MENU UTAMA</div>
      <nav className="side-nav" aria-label="Menu utama">
        {MENU.map((item) => (
          <a
            key={item.route}
            className={`nav-item${item.route === route ? " active" : ""}`}
            href={`#${item.route}`}
            aria-current={item.route === route ? "page" : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {counts[item.route] !== undefined && <span className="nav-count">{counts[item.route]}</span>}
          </a>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">✦</div>
          <strong>Butuh bantuan?</strong>
          <p>Kelola data akademik dengan lebih mudah.</p>
        </div>
        <div className="profile">
          <div className="profile-avatar">AD</div>
          <div className="profile-info">
            <strong>Administrator</strong>
            <span>Admin Akademik</span>
          </div>
          <span className="profile-dots">•••</span>
        </div>
      </div>
    </aside>
  );
}
