import { isSegmentComplete } from "../../progress";
import type { Segment, Weather } from "../../types/navigation";
import SegmentCard from "./SegmentCard";

interface SegmentListProps {
  segments: Segment[];
  currentSegmentNumber: number;
  completed: ReadonlySet<string>;
  day: number;
  weather: Weather;
  onToggleComplete: (segmentNumber: number) => void;
}

export default function SegmentList({
  segments,
  currentSegmentNumber,
  completed,
  day,
  weather,
  onToggleComplete,
}: SegmentListProps) {
  return (
    <div className="segment-list">
      {segments.map((segment) => (
        <SegmentCard
          key={segment.segmentNumber}
          segment={segment}
          isCurrent={segment.segmentNumber === currentSegmentNumber}
          isComplete={isSegmentComplete(
            completed,
            day,
            weather,
            segment.segmentNumber,
          )}
          onToggleComplete={() => onToggleComplete(segment.segmentNumber)}
        />
      ))}
    </div>
  );
}
