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
        <div className="segment-card-heading">
          <button
            type="button"
            className="segment-select"
            onClick={onSelect}
            aria-pressed={isCurrent}
            aria-label={
              isCurrent
                ? `${segment.name}, current segment`
                : `Set ${segment.name} as current segment`
            }
          >
            <h2 className="segment-name">{segment.name}</h2>
            <p className="segment-mode">{segment.mode}</p>
          </button>
          <p
            className="segment-index"
            aria-label={`Segment ${segment.segmentNumber}`}
          >
            Segm {segment.segmentNumber}
          </p>
        </div>
        <div className="segment-card-chips">
          {isCurrent ? <p className="current-chip">Current</p> : null}
          {segment.conditional ? (
            <p className="optional-chip">Optional</p>
          ) : null}
          {isComplete ? <p className="done-chip">Done</p> : null}
          {isCurrent ? null : (
            <button
              type="button"
              className="set-current"
              onClick={onSelect}
            >
              Set current
            </button>
          )}
        </div>
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
