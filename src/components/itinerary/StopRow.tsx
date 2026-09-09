import { getMasterStop } from "../../data/navigation";
import type { SegmentStop } from "../../types/navigation";

interface StopRowProps {
  stop: SegmentStop;
}

export default function StopRow({ stop }: StopRowProps) {
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
        <span className="stop-name">{stop.name}</span>
        {kind ? <span className="stop-kind">{kind}</span> : null}
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
