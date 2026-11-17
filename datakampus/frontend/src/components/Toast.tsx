import type { ToastState } from "../hooks/useToast";

type Props = { toast: ToastState | null; onClose: () => void };

export default function Toast({ toast, onClose }: Props) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} role="status">
      <span className="toast-symbol">{toast.type === "success" ? "✓" : "!"}</span>
      <span>{toast.text}</span>
      <button onClick={onClose} aria-label="Tutup notifikasi">×</button>
    </div>
  );
}
