import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";
import StopRow from "./StopRow";

interface SegmentCardProps {
  segment: Segment;
  isCurrent: boolean;
  isComplete: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
}

export default function SegmentCard({
  segment,
  isCurrent,
  isComplete,
  onSelect,
  onToggleComplete,
}: SegmentCardProps) {
  const notes = segment.notes.trim();
  const classes = [
    "segment-card",
    isCurrent ? "is-current" : "",
    isComplete ? "is-complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
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
        {isComplete ? <p className="done-chip">Done</p> : null}
      </header>
      {notes ? <p className="segment-notes">{notes}</p> : null}
      <ol className="stop-list">
        {segment.stops.map((stop) => (
          <StopRow key={`${stop.order}-${stop.stopId}`} stop={stop} />
        ))}
      </ol>
      <MapsActions segment={segment} />
      <button
        type="button"
        className={isComplete ? "done-button is-complete" : "done-button"}
        onClick={onToggleComplete}
        aria-pressed={isComplete}
      >
        {isComplete ? "Undo done" : "Mark done"}
      </button>
    </article>
  );
}
