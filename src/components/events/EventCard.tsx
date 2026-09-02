import { useLayoutEffect, useRef, useState } from "react";
import { formatChipDate } from "../../date";
import type { TripEvent } from "../../types/events";
import EventBadges from "./EventBadges";

interface EventCardProps {
  event: TripEvent;
}

function formatWhen(event: TripEvent): string {
  const date = formatChipDate(event.date);
  if (!event.startTime) {
    return date;
  }
  if (event.endTime) {
    return `${date} · ${event.startTime}–${event.endTime}`;
  }
  return `${date} · ${event.startTime}`;
}

export function eventPriceLabel(priceSek: number | null): string | null {
  return typeof priceSek === "number" ? `${priceSek} SEK` : null;
}

function displayLanguage(language: string): string | null {
  return language === "Music-led" ? null : language;
}

function isTripFitWarning(tripFit: string): boolean {
  return (
    tripFit.startsWith("Not recommended") || tripFit.startsWith("Not feasible")
  );
}

export default function EventCard({ event }: EventCardProps) {
  const tripFitRef = useRef<HTMLParagraphElement>(null);
  const [tripFitClamped, setTripFitClamped] = useState(false);
  const price = eventPriceLabel(event.priceSek);
  const language = displayLanguage(event.language);
  const notes = event.notes.trim();
  const warning = isTripFitWarning(event.tripFit);

  useLayoutEffect(() => {
    const el = tripFitRef.current;
    if (!el) {
      return;
    }
    setTripFitClamped(el.scrollHeight > el.clientHeight + 1);
  }, [event.tripFit]);

  const detailsNeeded = Boolean(notes) || tripFitClamped;

  return (
    <article className="attraction-card event-card">
      <h3 className="attraction-name">{event.name}</h3>
      <p className="attraction-meta">{formatWhen(event)}</p>
      <p className="attraction-meta">
        {event.venue} · {event.area}
      </p>
      <p className="attraction-facts">{event.category}</p>
      <EventBadges event={event} />
      {price ? <p className="attraction-facts">{price}</p> : null}
      {language ? <p className="attraction-facts">{language}</p> : null}
      <p
        ref={tripFitRef}
        className={
          warning ? "event-tripfit is-warning" : "event-tripfit"
        }
      >
        {event.tripFit}
      </p>
      {detailsNeeded ? (
        <details className="attraction-notes">
          <summary>Notes</summary>
          {tripFitClamped ? <p>{event.tripFit}</p> : null}
          {notes ? <p>{notes}</p> : null}
        </details>
      ) : null}
      <div className="attraction-actions">
        <a
          className="maps-button"
          href={event.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
        <a
          className="source-button"
          href={event.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Tickets
        </a>
      </div>
    </article>
  );
}
