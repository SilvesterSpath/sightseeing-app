interface AttractionsSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AttractionsSearch({
  value,
  onChange,
}: AttractionsSearchProps) {
  return (
    <label className="attractions-search">
      <span className="visually-hidden">Search attractions</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name, area, category"
        autoComplete="off"
      />
    </label>
  );
}
