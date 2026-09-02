import type { SegmentStop } from "../../types/navigation";

interface StopRowProps {
  stop: SegmentStop;
}

export default function StopRow({ stop }: StopRowProps) {
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
      </a>
    </li>
  );
}
