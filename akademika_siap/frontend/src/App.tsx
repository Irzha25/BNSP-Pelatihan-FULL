import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity, BookOpen, CalendarDays, ChevronDown, CircleHelp, GraduationCap,
  LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, ShieldCheck,
  Users, UserRound, X, Pencil, Trash2, Download, Bell, ArrowUpRight,
  ClipboardList, FileText, Layers3, RefreshCw
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";
const http = axios.create({ baseURL: API });
type User = { id: number; name: string; email: string; role: "admin"|"dosen"|"mahasiswa" };
type Field = [string,string];
type Resource = { key: string; label: string; fields: Field[] };
const icons: Record<string, any> = {
  dashboard: LayoutDashboard, mahasiswa: Users, dosen: UserRound, prodi: Layers3,
  "mata-kuliah": BookOpen, "tahun-akademik": CalendarDays, kelas: ClipboardList,
  krs: FileText, nilai: Activity, ipk: GraduationCap, jadwal: CalendarDays, transkrip: FileText
};
const nice = (s: string) => s.replaceAll("_"," ").replace(/(^|\s)\S/g, m => m.toUpperCase());
const display = (v: any) => v === null || v === undefined || v === "" ? "—" : typeof v === "boolean" ? (v ? "Ya" : "Tidak") : String(v);

export default function App() {
  const [token,setToken] = useState(localStorage.getItem("akademika_token") || "");
  const [user,setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem("akademika_user") || "null"); } catch { return null; }
  });
  const [active,setActive] = useState("dashboard");
  const [collapsed,setCollapsed] = useState(false);
  const [resources,setResources] = useState<Resource[]>([]);
  const [stats,setStats] = useState<any>({});
  const [rows,setRows] = useState<any[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [query,setQuery] = useState("");
  const [modal,setModal] = useState<"create"|"edit"|null>(null);
  const [editing,setEditing] = useState<any>(null);
  const [form,setForm] = useState<Record<string,any>>({});
  const [notice,setNotice] = useState("");
  const [loginEmail,setLoginEmail] = useState("admin@akademika.local");
  const [loginPassword,setLoginPassword] = useState("Admin123!");
  const [loginBusy,setLoginBusy] = useState(false);

  useEffect(() => {
    if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete http.defaults.headers.common.Authorization;
  },[token]);

  useEffect(() => {
    if (!token) return;
    http.get("/resources").then(r=>setResources(r.data)).catch(()=>setResources([]));
    http.get("/stats").then(r=>setStats(r.data)).catch(()=>{});
  },[token]);

  const resource = resources.find(r=>r.key===active);
  const admin = user?.role === "admin";
  const menu = useMemo(() => {
    const base = [{key:"dashboard",label:"Ringkasan",group:"UMUM"}];
    if (user?.role === "admin") return [...base,
      {key:"mahasiswa",label:"Mahasiswa",group:"DATA AKADEMIK"},
      {key:"dosen",label:"Dosen",group:"DATA AKADEMIK"},
      {key:"prodi",label:"Program Studi",group:"DATA AKADEMIK"},
      {key:"mata-kuliah",label:"Mata Kuliah",group:"AKADEMIK"},
      {key:"tahun-akademik",label:"Tahun Akademik",group:"AKADEMIK"},
      {key:"kelas",label:"Kelas & Jadwal",group:"AKADEMIK"},
      {key:"krs",label:"KRS",group:"AKADEMIK"},
      {key:"nilai",label:"Nilai",group:"AKADEMIK"},
      {key:"ipk",label:"IPK Mahasiswa",group:"LAPORAN"},
      {key:"transkrip",label:"Transkrip",group:"LAPORAN"}];
    if (user?.role === "dosen") return [...base,
      {key:"kelas",label:"Kelas & Jadwal",group:"AKADEMIK"},
      {key:"mahasiswa",label:"Mahasiswa",group:"DATA AKADEMIK"},
      {key:"mata-kuliah",label:"Mata Kuliah",group:"DATA AKADEMIK"},
      {key:"nilai",label:"Nilai",group:"AKADEMIK"},
      {key:"jadwal",label:"Jadwal",group:"LAPORAN"}];
    return [...base,{key:"jadwal",label:"Jadwal Kuliah",group:"AKADEMIK"},
      {key:"krs",label:"KRS Saya",group:"AKADEMIK"},{key:"transkrip",label:"Transkrip Nilai",group:"LAPORAN"}];
  },[user]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoginBusy(true); setError("");
    try {
      const r = await axios.post(`${API}/auth/login`,{email:loginEmail,password:loginPassword});
      localStorage.setItem("akademika_token",r.data.token);
      localStorage.setItem("akademika_user",JSON.stringify(r.data.user));
      setToken(r.data.token); setUser(r.data.user); setActive("dashboard"); setNotice("Selamat datang kembali.");
    } catch (e:any) { setError(e.response?.data?.message || "Login gagal. Pastikan backend dan database aktif."); }
    finally { setLoginBusy(false); }
  }
  function logout() {
    localStorage.removeItem("akademika_token"); localStorage.removeItem("akademika_user");
    setToken(""); setUser(null); setRows([]); setActive("dashboard");
  }
  async function loadRows(key=active) {
    setLoading(true); setError(""); setQuery("");
    try {
      const r = await http.get(`/${key}`);
      setRows(Array.isArray(r.data) ? r.data : []);
    } catch (e:any) {
      setRows([]); setError(e.response?.data?.message || "Gagal mengambil data. Periksa backend dan koneksi database.");
    } finally { setLoading(false); }
  }
  useEffect(() => {
    if (token && active !== "dashboard") loadRows(active);
    if (active === "dashboard" && token) http.get("/stats").then(r=>setStats(r.data)).catch(()=>{});
  },[active,token]);

  function openCreate() {
    if (!resource) return;
    const initial:Record<string,any> = {};
    resource.fields.forEach(([k])=>initial[k] = k==="aktif" ? false : "");
    setForm(initial); setEditing(null); setModal("create");
  }
  function openEdit(row:any) {
    if (!resource) return;
    const initial:Record<string,any> = {};
    resource.fields.forEach(([k])=>initial[k] = row[k] ?? "");
    setForm(initial); setEditing(row); setModal("edit");
  }
  async function save(e:React.FormEvent) {
    e.preventDefault(); if (!resource) return;
    setError("");
    const payload:Record<string,any> = {};
    resource.fields.forEach(([key])=>{
      let v = form[key];
      if (v === "") v = null;
      if (["id_prodi","id_mk","id_dosen","id_ta","id_mahasiswa","id_kelas","id_krs","sks","semester_ke","angkatan"].includes(key) && v !== null) v=Number(v);
      if (["nilai_tugas","nilai_uts","nilai_uas"].includes(key) && v !== null) v=Number(v);
      if (key==="aktif") v=Boolean(v);
      payload[key]=v;
    });
    try {
      if (modal==="edit") await http.patch(`/${active}/${editing[resource.key==="nilai"?"id_krs":resource.key==="prodi"?"id_prodi":resource.key==="dosen"?"id_dosen":resource.key==="mahasiswa"?"id_mahasiswa":resource.key==="mata-kuliah"?"id_mk":resource.key==="tahun-akademik"?"id_ta":resource.key==="kelas"?"id_kelas":"id_krs"]}`,payload);
      else await http.post(`/${active}`,payload);
      setModal(null); setNotice(modal==="edit"?"Data berhasil diperbarui.":"Data berhasil ditambahkan."); await loadRows();
      http.get("/stats").then(r=>setStats(r.data)).catch(()=>{});
    } catch (e:any) { setError(e.response?.data?.message || "Gagal menyimpan data."); }
  }
  async function remove(row:any) {
    if (!resource) return;
    const idKey = active==="nilai"?"id_krs":active==="prodi"?"id_prodi":active==="dosen"?"id_dosen":active==="mahasiswa"?"id_mahasiswa":active==="mata-kuliah"?"id_mk":active==="tahun-akademik"?"id_ta":active==="kelas"?"id_kelas":"id_krs";
    if (!window.confirm(`Hapus data ${display(row[resource.fields[0][0]])}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try { await http.delete(`/${active}/${row[idKey]}`); setNotice("Data berhasil dihapus."); await loadRows(); }
    catch(e:any) { setError(e.response?.data?.message || "Gagal menghapus. Pastikan data tidak direferensikan tabel lain."); }
  }

  if (!token || !user) return <div className="login-shell">
    <section className="login-brand"><div className="brand-mark"><GraduationCap size={30}/></div><div className="eyebrow">UNUSIA · SISTEM AKADEMIK</div><h1>Semua urusan akademik, dalam satu ruang.</h1><p>Platform terintegrasi untuk mengelola data mahasiswa, dosen, perkuliahan, KRS, dan hasil studi.</p><div className="login-decoration"><div/><div/><div/></div><small>AKADEMIKA · PORTAL AKADEMIK TERPADU</small></section>
    <section className="login-panel"><form className="login-card" onSubmit={login}><div className="mini-brand"><GraduationCap/> AKADEMIKA</div><span className="eyebrow">SELAMAT DATANG</span><h2>Masuk ke portal</h2><p className="muted">Gunakan akun akademik untuk melanjutkan.</p>
      {error&&<div className="alert">{error}</div>}
      <label>Email</label><input type="email" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="nama@kampus.ac.id"/>
      <label>Password</label><input type="password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Masukkan password"/>
      <button className="primary full" disabled={loginBusy}>{loginBusy?"Memeriksa...":"Masuk ke Dashboard"} <ArrowUpRight size={17}/></button>
      <div className="demo-hint"><ShieldCheck size={16}/><span>Akun demo lokal tersedia di README. Ganti password sebelum digunakan sungguhan.</span></div>
    </form><span className="login-footer">© 2026 SIAKAD UNUSIA · Sistem Informasi Akademik</span></section>
  </div>;

  const filtered = rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  const title = menu.find(m=>m.key===active)?.label || "Ringkasan";
  const currentIcon = icons[active] || LayoutDashboard;
  const ActiveIcon = currentIcon;
  const resourceId = (r:any) => r.id_mahasiswa ?? r.id_dosen ?? r.id_prodi ?? r.id_mk ?? r.id_ta ?? r.id_kelas ?? r.id_krs ?? "";
  const statsCards = [
    {label:"Total Mahasiswa",value:stats.mahasiswa ?? "—",icon:Users,tone:"violet",foot:"Data terdaftar"},
    {label:"Total Dosen",value:stats.dosen ?? "—",icon:UserRound,tone:"blue",foot:"Tenaga pengajar"},
    {label:"Mata Kuliah",value:stats.mata_kuliah ?? "—",icon:BookOpen,tone:"amber",foot:"Katalog akademik"},
    {label:"Rata-rata IPK",value:stats.rata_ipk ?? "—",icon:Activity,tone:"green",foot:"Berdasarkan transkrip"}
  ];

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed?"collapsed":""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={24}/></div>{!collapsed&&<div><strong>AKADEMIKA</strong><span>UNUSIA · PORTAL</span></div>}</div>
      <div className="workspace"><div className="workspace-dot"/> {!collapsed&&<><div><b>Academic Office</b><small>Workspace kampus</small></div><ChevronDown size={15}/></>}</div>
      <nav className="side-nav">{Array.from(new Set(menu.map(m=>m.group))).map(group=><div key={group}><div className="nav-label">{!collapsed&&group}</div>{menu.filter(m=>m.group===group).map(item=>{const Icon=icons[item.key]||LayoutDashboard;return <button key={item.key} className={`nav-item ${active===item.key?"selected":""}`} onClick={()=>setActive(item.key)} title={item.label}><Icon size={18}/>{!collapsed&&<span>{item.label}</span>}{active===item.key&&!collapsed&&<i/>}</button>})}</div>)}</nav>
      <div className="sidebar-bottom"><div className="help-link"><CircleHelp size={18}/>{!collapsed&&<span>Pusat bantuan</span>}</div><div className="profile"><div className="avatar">{user.name.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase()}</div>{!collapsed&&<div className="profile-text"><b>{user.name}</b><small>{user.role.toUpperCase()}</small></div>}<button className="icon-button logout" onClick={logout} title="Keluar"><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-button" onClick={()=>setCollapsed(!collapsed)}><Menu size={20}/></button><div className="breadcrumbs">Portal <span>/</span> <b>{title}</b></div></div><div className="top-actions"><div className="system-status"><span/> Sistem aktif</div><button className="icon-button notification" onClick={()=>setNotice("Tidak ada notifikasi baru.")}><Bell size={19}/><i/></button><div className="top-avatar">{user.name.slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">SIAKAD UNUSIA / {title.toUpperCase()}</div><h1>{active==="dashboard"?"Ringkasan Akademik":title}</h1><p>{active==="dashboard"?"Pantau aktivitas dan data akademik kampus dari satu dashboard.":`Kelola dan pantau ${title.toLowerCase()} dalam sistem akademik terintegrasi.`}</p></div>{active!=="dashboard"&&resource&&admin&&<button className="primary" onClick={openCreate}><Plus size={18}/> Tambah Data</button>}</div>
        {notice&&<div className="toast"><ShieldCheck size={17}/>{notice}<button onClick={()=>setNotice("")}><X size={15}/></button></div>}
        {error&&<div className="alert page-alert">{error}<button onClick={()=>setError("")}><X size={15}/></button></div>}
        {active==="dashboard"? <>
          <div className="welcome-banner"><div><div className="welcome-chip"><span/> RINGKASAN SISTEM</div><h2>Selamat datang, {user.name.split(" ")[0]} 👋</h2><p>Berikut gambaran umum data akademik yang tersimpan di sistem.</p></div><div className="banner-art"><div className="art-circle"><GraduationCap size={46}/></div><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div></div>
          <div className="stats-grid">{statsCards.map(s=><div className="stat-card" key={s.label}><div className={`stat-icon ${s.tone}`}><s.icon size={21}/></div><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-foot"><span className="tiny-dot"/> {s.foot}</div></div>)}</div>
          <div className="dashboard-grid"><section className="panel quick-panel"><div className="panel-heading"><div><h3>Akses cepat</h3><p>Pilih modul untuk mulai bekerja</p></div><Layers3 size={20}/></div><div className="quick-grid">{menu.filter(m=>m.key!=="dashboard").slice(0,8).map(m=>{const Icon=icons[m.key]||LayoutDashboard;return <button className="quick-link" key={m.key} onClick={()=>setActive(m.key)}><span><Icon size={20}/></span><b>{m.label}</b><ArrowUpRight size={15}/></button>})}</div></section><section className="panel info-panel"><div className="panel-heading"><div><h3>Informasi sistem</h3><p>Status layanan akademik</p></div><Activity size={20}/></div><div className="service-row"><div className="service-icon"><ShieldCheck size={19}/></div><div><b>Portal akademik</b><small>Antarmuka web</small></div><span className="status-pill">Aktif</span></div><div className="service-row"><div className="service-icon"><Settings2 size={19}/></div><div><b>API backend</b><small>Express REST API</small></div><span className="status-pill">Terhubung*</span></div><div className="service-row"><div className="service-icon"><Layers3 size={19}/></div><div><b>Basis data</b><small>PostgreSQL · schema akademika</small></div><span className="status-pill">Ready*</span></div><p className="note-small">* Status koneksi diverifikasi saat permintaan API dilakukan.</p></section></div>
        </>:<section className="panel data-panel">
          <div className="data-toolbar"><div><h3>Daftar {title}</h3><p>{filtered.length} data ditemukan · maksimum 500 data ditampilkan</p></div><div className="toolbar-actions"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari data..."/>{query&&<button onClick={()=>setQuery("")}><X size={14}/></button>}</div><button className="outline" onClick={()=>loadRows()}><RefreshCw size={16}/> Segarkan</button><button className="outline export" onClick={()=>{const csv=[Object.keys(rows[0]||{}).join(","),...filtered.map(r=>Object.values(r).map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(","))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}));a.download=`${active}.csv`;a.click();URL.revokeObjectURL(a.href);}}><Download size={16}/> Export</button></div></div>
          <div className="table-wrap">{loading?<div className="empty"><RefreshCw className="spin" size={24}/><b>Memuat data...</b></div>:filtered.length===0?<div className="empty"><Search size={28}/><b>{error?"Data belum bisa dimuat":"Belum ada data"}</b><span>{error?"Periksa terminal backend dan konfigurasi .env.":"Coba kata kunci lain atau tambahkan data baru."}</span></div>:<table><thead><tr>{Object.keys(filtered[0]).map(k=><th key={k}>{nice(k)}</th>)}{admin&&<th className="action-head">Aksi</th>}</tr></thead><tbody>{filtered.map((row,i)=><tr key={resourceId(row)||i}>{Object.entries(row).map(([k,v])=><td key={k}>{k==="status"?<span className={`status-tag ${String(v).toLowerCase()}`}>{display(v)}</span>:k==="aktif"?<span className={`status-tag ${v?"aktif":"nonaktif"}`}>{display(v)}</span>:display(v)}</td>)}{admin&&<td><div className="row-actions"><button title="Edit" onClick={()=>openEdit(row)}><Pencil size={16}/></button><button title="Hapus" className="delete" onClick={()=>remove(row)}><Trash2 size={16}/></button></div></td>}</tr>)}</tbody></table>}</div>
          <div className="table-footer"><span>Menampilkan {filtered.length} dari {rows.length} data</span><span>Data bersumber dari PostgreSQL <span className="footer-dot"/></span></div>
        </section>}
        <footer className="page-footer"><span>© 2026 Akademika UNUSIA</span><span>Portal Sistem Informasi Akademik <b>•</b> v1.0.0</span></footer>
      </div>
    </main>
    {modal&&resource&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(null)}}><form className="modal" onSubmit={save}><div className="modal-header"><div><span className="eyebrow">{modal==="edit"?"PERBARUI DATA":"FORMULIR DATA BARU"}</span><h2>{modal==="edit"?"Edit":"Tambah"} {title}</h2></div><button type="button" className="icon-button" onClick={()=>setModal(null)}><X size={19}/></button></div><div className="modal-body">{resource.fields.map(([key,label])=><label className="form-field" key={key}><span>{label}{key!=="email"&&key!=="tanggal_lahir"&&key!=="ruang"&&key!=="tanggal_ambil"?" *":""}</span>{key==="aktif"?<select value={String(form[key])} onChange={e=>setForm({...form,[key]:e.target.value==="true"})}><option value="true">Aktif</option><option value="false">Tidak aktif</option></select>:key==="jenis_kelamin"?<select required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="">Pilih...</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>:key==="status"?<select required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}>{["Aktif","Cuti","Lulus","Nonaktif"].map(x=><option key={x}>{x}</option>)}</select>:key==="semester"?<select required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="">Pilih...</option><option>Ganjil</option><option>Genap</option></select>:<input required={!["email","tanggal_lahir","ruang","tanggal_ambil"].includes(key)} type={key.includes("tanggal")?"date":key.includes("jam_")?"time":key==="email"?"email":["sks","semester_ke","angkatan","id_prodi","id_mk","id_dosen","id_ta","id_mahasiswa","id_kelas","id_krs","nilai_tugas","nilai_uts","nilai_uas"].includes(key)?"number":"text"} min={["nilai_tugas","nilai_uts","nilai_uas"].includes(key)?0:undefined} max={["nilai_tugas","nilai_uts","nilai_uas"].includes(key)?100:undefined} step={["nilai_tugas","nilai_uts","nilai_uas"].includes(key)?"0.01":undefined} value={form[key]??""} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={`Masukkan ${label.toLowerCase()}`}/>}</label>)}</div><div className="modal-footer"><button type="button" className="outline" onClick={()=>setModal(null)}>Batal</button><button className="primary"><ShieldCheck size={16}/>{modal==="edit"?"Simpan Perubahan":"Simpan Data"}</button></div></form></div>}
  </div>;
}
