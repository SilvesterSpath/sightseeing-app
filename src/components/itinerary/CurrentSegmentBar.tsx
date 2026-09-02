import type { Segment } from "../../types/navigation";
import MapsActions from "./MapsActions";

interface CurrentSegmentBarProps {
  segment: Segment;
  index: number;
  total: number;
}

export default function CurrentSegmentBar({
  segment,
  index,
  total,
}: CurrentSegmentBarProps) {
  return (
    <div className="current-segment-bar" role="status">
      <p className="current-segment-meta">
        Segment {index} of {total} · {segment.mode}
      </p>
      <p className="current-segment-name">{segment.name}</p>
      <MapsActions segment={segment} compact />
    </div>
  );
}
