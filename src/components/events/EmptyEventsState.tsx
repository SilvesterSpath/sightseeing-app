interface EmptyEventsStateProps {
  onReset: () => void;
}

export default function EmptyEventsState({ onReset }: EmptyEventsStateProps) {
  return (
    <div className="empty-events" role="status">
      <p>No events match these filters.</p>
      <button type="button" className="reset-filters" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
