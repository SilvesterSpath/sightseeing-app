import { getMasterStop } from "../../data/navigation";
import { legModePhrase } from "../../data/travel";
import type { SegmentStop } from "../../types/navigation";
import type { LegMode } from "../../types/travel";

interface StopRowProps {
  stop: SegmentStop;
  nextStop?: SegmentStop;
  durationMinutes?: number;
  legMode?: LegMode;
}

export default function StopRow({
  stop,
  nextStop,
  durationMinutes,
  legMode,
}: StopRowProps) {
  const master = getMasterStop(stop.stopId);
  const kind = master?.type.trim() ?? "";
  const website = master?.sourceUrl.trim() ?? "";
  return (
    <li className="stop-row">
      <a
        className="stop-link"
        href={stop.googleMapsSearchUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="stop-order">{stop.order}.</span>
        <span className="stop-name" title={stop.name}>
          {stop.name}
        </span>
        {nextStop &&
        durationMinutes != null &&
        durationMinutes > 0 &&
        legMode ? (
          <span
            className="stop-duration"
            aria-label={`${durationMinutes} minutes ${legModePhrase(legMode)} to ${nextStop.name}`}
          >
            <span className="stop-duration-time">{durationMinutes} min</span>
            <span className="stop-duration-arrow" aria-hidden="true">
              {" "}
              →
            </span>
          </span>
        ) : null}
        {kind ? (
          <span className="stop-kind" title={kind}>
            {kind}
          </span>
        ) : null}
      </a>
      {website ? (
        <a
          className="stop-site source-button"
          href={website}
          target="_blank"
          rel="noreferrer"
          aria-label={`Website for ${stop.name}`}
        >
          Web
        </a>
      ) : null}
    </li>
  );
}
