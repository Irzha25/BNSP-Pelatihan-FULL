type Props = { title: string; offline: boolean };

export default function Topbar({ title, offline }: Props) {
  return (
    <header className="topbar">
      <div className="breadcrumb">Akademik <span>/</span> <strong>{title}</strong></div>
      <div className="topbar-right">
        <div className="system-status">
          <span className={`status-dot${offline ? " offline" : ""}`} />
          {offline ? "Server tidak terhubung" : "Sistem aktif"}
        </div>
        <div className="topbar-avatar">AD</div>
      </div>
    </header>
  );
}
