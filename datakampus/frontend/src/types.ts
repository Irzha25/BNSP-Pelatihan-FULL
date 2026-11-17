export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  angkatan: number;
  email: string | null;
  jenis_kelamin: string | null;
  created_at: string;
};

export type UserRow = {
  uuid: string;
  id_mhs: number;
  email: string;
  nim: string;
  mahasiswa_nama: string;
  jenis_kelamin: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type ActivityLog = {
  id: number;
  action: string;
  mahasiswa_nim: string | null;
  mahasiswa_nama: string | null;
  created_at: string;
};

// Bentuk respons backend untuk POST dan PATCH.
export type MutationResult<T> = { message: string; data: T };

export type ListState<T> = {
  items: T[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
};

export type ShowToast = (text: string, type?: "success" | "error") => void;
