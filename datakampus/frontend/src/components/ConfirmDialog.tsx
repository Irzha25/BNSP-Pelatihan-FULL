import type { ReactNode } from "react";
import Modal from "./Modal";

type Props = {
  title: string;
  confirmLabel: string;
  busyLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
};

export default function ConfirmDialog({ title, confirmLabel, busyLabel, busy, onConfirm, onCancel, children }: Props) {
  return (
    <Modal labelledBy="confirm-title" className="delete-modal" onClose={() => !busy && onCancel()}>
      <div className="delete-warning-icon">!</div>
      <div className="delete-copy">
        <h2 id="confirm-title">{title}</h2>
        <p>{children}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={busy}>Batal</button>
        <button type="button" className="danger-button" onClick={onConfirm} disabled={busy}>
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
