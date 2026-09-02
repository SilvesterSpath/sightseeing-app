import type { TripEvent } from "../../types/events";

interface EventBadgesProps {
  event: TripEvent;
}

export function statusBadges(status: string): string[] {
  if (status === "Scheduled — verify time") {
    return ["Scheduled", "Verify time"];
  }
  if (status === "On sale — verify time") {
    return ["On sale", "Verify time"];
  }
  return [status];
}

export default function EventBadges({ event }: EventBadgesProps) {
  const indoor = event.indoorOutdoor.trim();

  return (
    <ul className="attraction-badges">
      {statusBadges(event.status).map((badge) => (
        <li key={badge} data-kind={badge}>
          {badge}
        </li>
      ))}
      {indoor ? <li data-kind="place">{indoor}</li> : null}
    </ul>
  );
}
