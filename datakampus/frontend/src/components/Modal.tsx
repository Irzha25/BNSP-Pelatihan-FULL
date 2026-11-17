import type { ReactNode } from "react";

type Props = {
  labelledBy: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
};

/** Jendela dialog; klik area gelap di luar kotak memanggil onClose. */
export default function Modal({ labelledBy, onClose, className = "", children }: Props) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`student-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>
  );
}
