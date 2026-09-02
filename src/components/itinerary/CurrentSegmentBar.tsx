import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";

interface CurrentSegmentBarProps {
  segment: Segment;
  index: number;
  total: number;
  isComplete: boolean;
  onToggleComplete: () => void;
}

export default function CurrentSegmentBar({
  segment,
  index,
  total,
  isComplete,
  onToggleComplete,
}: CurrentSegmentBarProps) {
  return (
    <div className="current-segment-bar" role="status">
      <p className="current-segment-meta">
        Segment {index} of {total} · {segment.mode}
        {isComplete ? " · Done" : ""}
      </p>
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
