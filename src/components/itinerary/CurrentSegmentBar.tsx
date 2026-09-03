import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";

interface CurrentSegmentBarProps {
  segment: Segment;
  index: number;
  total: number;
  isComplete: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleComplete: () => void;
}

export default function CurrentSegmentBar({
  segment,
  index,
  total,
  isComplete,
  collapsed,
  onToggleCollapsed,
  onToggleComplete,
}: CurrentSegmentBarProps) {
  if (collapsed) {
    return (
      <button
        type="button"
        className="current-segment-bar is-collapsed"
        onClick={onToggleCollapsed}
        aria-expanded={false}
        aria-label={`Show current segment: ${segment.name}`}
      >
        <span className="current-segment-handle" />
      </button>
    );
  }

  return (
    <div className="current-segment-bar" role="status">
      <div className="current-segment-top">
        <p className="current-segment-meta">
          Segment {index} of {total} · {segment.mode}
          {isComplete ? " · Done" : ""}
        </p>
        <button
          type="button"
          className="current-segment-hide"
          onClick={onToggleCollapsed}
          aria-expanded={true}
          aria-label="Hide current segment"
        >
          Hide
        </button>
      </div>
      <p className="current-segment-name">{segment.name}</p>
      <div className="current-segment-actions">
        <MapsActions segment={segment} compact />
        <button
          type="button"
          className={
            isComplete ? "done-button is-compact is-complete" : "done-button is-compact"
          }
          onClick={onToggleComplete}
          aria-pressed={isComplete}
        >
          {isComplete ? "Undo" : "Done"}
        </button>
      </div>
    </div>
  );
}
