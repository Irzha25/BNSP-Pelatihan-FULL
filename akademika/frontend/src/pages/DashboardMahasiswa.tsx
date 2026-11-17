import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interface untuk mendefinisikan bentuk data yang datang dari API Anda
interface Mahasiswa {
    id_mahasiswa: number;
    nim: string;
    nama_mahasiswa: string;
    nama_prodi: string;
    status: string;
}

const DashboardMahasiswa = () => {
    // State untuk menyimpan data dari API
    const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk mengambil data dari Backend Anda (GET /api/v1/mahasiswa)
    const fetchMahasiswa = async () => {
        try {
            setLoading(true);
            // Menembak endpoint API yang ada di index.ts Anda
            const response = await axios.get('http://localhost:4000/api/v1/mahasiswa');
            // Menyimpan array data ke dalam state
            setMahasiswas(response.data.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengambil data mahasiswa');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi untuk menghapus data (DELETE /api/v1/mahasiswa/:id)
    const handleDelete = async (id: number, nama: string) => {
        if (window.confirm(`Yakin ingin menghapus data ${nama}?`)) {
            try {
                await axios.delete(`http://localhost:4000/api/v1/mahasiswa/${id}`);
                // Panggil ulang data setelah berhasil menghapus
                fetchMahasiswa();
                alert('Data berhasil dihapus');
            } catch (err: any) {
                alert(err.response?.data?.message || 'Gagal menghapus data');
            }
        }
    };

    // Menjalankan fetchMahasiswa saat komponen pertama kali dimuat
    useEffect(() => {
        fetchMahasiswa();
    }, []);

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
            {/* Breadcrumb & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <nav className="flex text-sm text-gray-500 space-x-2">
                        <a href="#" className="hover:text-accent">Dashboard</a>
                        <span>/</span>
                        <span className="text-slate-800 font-medium">Mahasiswa</span>
                    </nav>
                </div>
                <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors flex items-center">
                        <i className="fa-solid fa-plus mr-2"></i> Tambah Mahasiswa
                    </button>
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Status Tampilan */}
                {loading && <div className="p-8 text-center text-gray-500">Memuat data mahasiswa...</div>}
                {error && <div className="p-8 text-center text-red-500">{error}</div>}
                
                {/* Tabel Data (Hanya tampil jika tidak loading dan tidak error) */}
                {!loading && !error && (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">NIM</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Nama Lengkap</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Program Studi</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-slate-700">
                                {mahasiswas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">Belum ada data mahasiswa</td>
                                    </tr>
                                ) : (
                                    mahasiswas.map((mhs) => (
                                        <tr key={mhs.id_mahasiswa} className="hover:bg-slate-50 transition-colors even:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-slate-900">{mhs.nim}</td>
                                            <td className="py-3 px-4">{mhs.nama_mahasiswa}</td>
                                            <td className="py-3 px-4">{mhs.nama_prodi}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    mhs.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {mhs.status || 'Aktif'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button className="text-slate-400 hover:text-accent transition-colors p-1" title="Edit">
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(mhs.id_mahasiswa, mhs.nama_mahasiswa)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-2" 
                                                    title="Hapus"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardMahasiswa;