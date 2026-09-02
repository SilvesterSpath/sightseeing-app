interface EmptyAttractionsStateProps {
  onReset: () => void;
}

export default function EmptyAttractionsState({
  onReset,
}: EmptyAttractionsStateProps) {
  return (
    <div className="empty-attractions" role="status">
      <p>No attractions match these filters.</p>
      <button type="button" className="reset-filters" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
