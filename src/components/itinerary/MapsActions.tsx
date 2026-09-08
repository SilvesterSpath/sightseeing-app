import {
  buildDirectionsUrl,
  chunkStops,
  isTransitFamily,
  needsOpenInParts,
} from "../../maps";
import type { Segment, SegmentStop } from "../../types/navigation";

interface MapsActionsProps {
  segment: Segment;
}

function partLabel(
  chunk: SegmentStop[],
  index: number,
  total: number,
): string {
  const heading = `Open part ${index + 1} of ${total}`;
  const from = chunk[0]?.name;
  const to = chunk[chunk.length - 1]?.name;
  if (!from || !to) {
    return heading;
  }
  return `${heading}: ${from} → ${to}`;
}

export default function MapsActions({ segment }: MapsActionsProps) {
  const transitFamily = isTransitFamily(segment.mode);
  const partsNeeded = needsOpenInParts(segment.stops, segment.mode);
  const parts = partsNeeded
    ? chunkStops(segment.stops, segment.mode)
    : [];
  const showParts = parts.length > 1;
  const fullUrl =
    transitFamily && partsNeeded
      ? null
      : buildDirectionsUrl(segment.stops, segment.mode);

  if (!fullUrl && !showParts) {
    return null;
  }

  const partsHeading = transitFamily
    ? "Consecutive transit legs"
    : "Route in parts";

  return (
    <div className="maps-actions">
      {fullUrl ? (
        <a
          className="maps-button"
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
      ) : null}
      {showParts ? (
        <>
          <p className="maps-legs-label">{partsHeading}</p>
          {parts.map((chunk, index) => {
            const partUrl = buildDirectionsUrl(chunk, segment.mode);
            if (!partUrl) {
              return null;
            }
            const label = partLabel(chunk, index, parts.length);
            return (
              <a
                key={`${chunk[0].stopId}-${index}`}
                className={fullUrl ? "maps-part-link" : "maps-button"}
                href={partUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
              >
                {label}
              </a>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
