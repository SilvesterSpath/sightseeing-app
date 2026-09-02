import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";
import StopRow from "./StopRow";

interface SegmentCardProps {
  segment: Segment;
  isCurrent: boolean;
  onSelect: () => void;
}

export default function SegmentCard({
  segment,
  isCurrent,
  onSelect,
}: SegmentCardProps) {
  const notes = segment.notes.trim();

  return (
    <article
      className={isCurrent ? "segment-card is-current" : "segment-card"}
    >
      <header className="segment-card-header">
        <button
          type="button"
          className="segment-select"
          onClick={onSelect}
          aria-pressed={isCurrent}
        >
          <h2 className="segment-name">{segment.name}</h2>
          <p className="segment-mode">{segment.mode}</p>
        </button>
        {segment.conditional ? (
          <p className="optional-chip">Optional</p>
        ) : null}
      </header>
      {notes ? <p className="segment-notes">{notes}</p> : null}
      <ol className="stop-list">
        {segment.stops.map((stop) => (
          <StopRow key={`${stop.order}-${stop.stopId}`} stop={stop} />
        ))}
      </ol>
      <MapsActions segment={segment} />
    </article>
  );
}
