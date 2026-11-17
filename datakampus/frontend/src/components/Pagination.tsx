type Props = {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, noun, onChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="table-footer">
      <span>Menampilkan <strong>{from}–{to}</strong> dari <strong>{total}</strong> {noun}</span>
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)}>← Sebelumnya</button>
        <span className="page-number">{page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Berikutnya →</button>
      </div>
    </div>
  );
}
