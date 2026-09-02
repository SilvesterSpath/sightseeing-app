import { eventsData, eventKey, getEvents } from "../../data/events";
import {
  formatEventDayHeading,
  formatResearchedDate,
  isoDateForTripDay,
} from "../../date";
import { groupEventsByDate } from "../../eventFilters";
import AppMenu from "../AppMenu";
import EventCard from "./EventCard";

interface EventsViewProps {
  itineraryDay: number;
}

export default function EventsView({ itineraryDay }: EventsViewProps) {
  const events = getEvents();
  const groups = groupEventsByDate(events);
  const itineraryDate = isoDateForTripDay(itineraryDay);
  const { researchedAt, importantNote, recordCount } = eventsData.meta;

  return (
    <section className="pane events-pane" aria-labelledby="events-heading">
      <header className="attractions-header">
        <div className="attractions-heading-row">
          <h1 id="events-heading">Events</h1>
          <p className="muted result-count">
            {events.length} of {recordCount}
          </p>
          <AppMenu />
        </div>
        <p className="stale-notice" role="note">
          Event information researched {formatResearchedDate(researchedAt)}.{" "}
          {importantNote}
        </p>
      </header>
      <div className="event-list">
        {groups.map((group) => {
          const itineraryDayGroup = group.date === itineraryDate;
          return (
            <section
              key={group.date}
              className={
                itineraryDayGroup
                  ? "event-day-group is-itinerary-day"
                  : "event-day-group"
              }
              aria-labelledby={`event-day-${group.date}`}
            >
              <h2
                id={`event-day-${group.date}`}
                className="event-day-heading"
              >
                {formatEventDayHeading(group.date)}
                {itineraryDayGroup ? (
                  <span className="event-day-current">Itinerary day</span>
                ) : null}
              </h2>
              {group.events.map((event) => (
                <EventCard key={eventKey(event)} event={event} />
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
