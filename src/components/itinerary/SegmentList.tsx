import type { Segment } from "../../types/navigation";
import SegmentCard from "./SegmentCard";

interface SegmentListProps {
  segments: Segment[];
  currentSegmentNumber: number;
  onSelectSegment: (segmentNumber: number) => void;
}

export default function SegmentList({
  segments,
  currentSegmentNumber,
  onSelectSegment,
}: SegmentListProps) {
  return (
    <div className="segment-list">
      {segments.map((segment) => (
        <SegmentCard
          key={segment.segmentNumber}
          segment={segment}
          isCurrent={segment.segmentNumber === currentSegmentNumber}
          onSelect={() => onSelectSegment(segment.segmentNumber)}
        />
      ))}
    </div>
  );
}
