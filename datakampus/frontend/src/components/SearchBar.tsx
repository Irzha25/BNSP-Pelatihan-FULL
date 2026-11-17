type Props = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
};

export default function SearchBar({ value, placeholder, onChange, onRefresh }: Props) {
  return (
    <div className="table-toolbar">
      <label className="search-box">
        <span className="search-icon">⌕</span>
        <input
          aria-label={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && <button className="clear-search" onClick={() => onChange("")} aria-label="Hapus pencarian">×</button>}
      </label>
      <button className="secondary-button" onClick={onRefresh} title="Muat ulang data">
        <span className="refresh-icon">↻</span> Refresh
      </button>
    </div>
  );
}
