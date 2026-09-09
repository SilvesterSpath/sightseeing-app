import {
  formatMinutesEstimate,
  resolveLegMode,
  segmentLegMinutes,
  segmentTravelMinutes,
} from "../../data/travel";
import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";
import StopRow from "./StopRow";

interface SegmentCardProps {
  segment: Segment;
  isCurrent: boolean;
  isComplete: boolean;
  onToggleComplete: () => void;
}

export default function SegmentCard({
  segment,
  isCurrent,
  isComplete,
  onToggleComplete,
}: SegmentCardProps) {
  const notes = segment.notes.trim();
  const totalMinutes = segmentTravelMinutes(segment);
  const modeLabel =
    totalMinutes == null
      ? segment.mode
      : `${segment.mode} · ${formatMinutesEstimate(totalMinutes)}`;
  const modeAria =
    totalMinutes == null
      ? segment.mode
      : `${segment.mode}, about ${totalMinutes} minutes travel`;
  const classes = [
    "segment-card",
    isCurrent ? "is-current" : "",
    isComplete ? "is-complete" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes} aria-current={isCurrent || undefined}>
      <header className="segment-card-header">
        <div className="segment-card-heading">
          <div className="segment-heading">
            <h2 className="segment-name">{segment.name}</h2>
            <p className="segment-mode" aria-label={modeAria}>
              {modeLabel}
            </p>
          </div>
          <p
            className="segment-index"
            aria-label={`Segment ${segment.segmentNumber}`}
          >
            Segm {segment.segmentNumber}
          </p>
        </div>
        {segment.conditional ? (
          <div className="segment-card-chips">
            <p className="optional-chip">Optional</p>
          </div>
        ) : null}
      </header>
      {notes ? <p className="segment-notes">{notes}</p> : null}
      <ol className="stop-list">
        {segment.stops.map((stop, index) => {
          const nextStop = segment.stops[index + 1];
          const durationMinutes = nextStop
            ? segmentLegMinutes(segment, index)
            : undefined;
          const legMode = nextStop
            ? resolveLegMode(segment, index)
            : undefined;
          return (
            <StopRow
              key={`${stop.order}-${stop.stopId}`}
              stop={stop}
              nextStop={nextStop}
              durationMinutes={durationMinutes}
              legMode={legMode}
            />
          );
        })}
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
