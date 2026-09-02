import {
  buildDirectionsUrl,
  chunkStops,
  needsOpenInParts,
} from "../../maps";
import type { Segment } from "../../types/navigation";

interface MapsActionsProps {
  segment: Segment;
  compact?: boolean;
}

export default function MapsActions({ segment, compact }: MapsActionsProps) {
  const fullUrl = buildDirectionsUrl(segment.stops, segment.mode);

  if (!fullUrl) {
    return null;
  }

  const showParts = !compact && needsOpenInParts(segment.stops);
  const parts = showParts ? chunkStops(segment.stops) : [];

  return (
    <div className={compact ? "maps-actions is-compact" : "maps-actions"}>
      <a
        className="maps-button"
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
      >
        Open in Google Maps
      </a>
      {showParts
        ? parts.map((chunk, index) => {
            const partUrl = buildDirectionsUrl(chunk, segment.mode);
            if (!partUrl) {
              return null;
            }
            return (
              <a
                key={`${chunk[0].stopId}-${index}`}
                className="maps-part-link"
                href={partUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open part {index + 1} of {parts.length}
              </a>
            );
          })
        : null}
    </div>
  );
}
