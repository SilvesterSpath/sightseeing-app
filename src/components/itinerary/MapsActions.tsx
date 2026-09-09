import {
  formatMinutesEstimate,
  partTravelMinutes,
} from "../../data/travel";
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

function partVisibleLabel(
  index: number,
  total: number,
  minutes: number | undefined,
): string {
  const heading = `Open part ${index + 1} of ${total}`;
  if (minutes == null) {
    return heading;
  }
  return `${heading} · ${formatMinutesEstimate(minutes)}`;
}

function partAriaLabel(
  chunk: SegmentStop[],
  index: number,
  total: number,
  minutes: number | undefined,
): string {
  const heading = `Open part ${index + 1} of ${total}`;
  const from = chunk[0]?.name;
  const to = chunk[chunk.length - 1]?.name;
  const time =
    minutes == null ? "" : `, about ${minutes} minutes`;
  if (!from || !to) {
    return `${heading}${time}`;
  }
  return `${heading}${time}: ${from} to ${to}`;
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
            const minutes = partTravelMinutes(chunk, segment);
            const visible = partVisibleLabel(index, parts.length, minutes);
            const aria = partAriaLabel(chunk, index, parts.length, minutes);
            return (
              <a
                key={`${chunk[0].stopId}-${index}`}
                className={fullUrl ? "maps-part-link" : "maps-button"}
                href={partUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={aria}
              >
                {visible}
              </a>
            );
          })}
        </>
      ) : null}
    </div>
  );
}
