type Props = { message: string; onRetry: () => void };

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span>⚠</span>
      <div>
        <strong>Data belum dapat dimuat</strong>
        <p>{message}. Pastikan backend berjalan di port 3000.</p>
      </div>
      <button className="retry-button" onClick={onRetry}>Coba lagi</button>
    </div>
  );
}
