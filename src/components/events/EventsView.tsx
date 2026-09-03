import { useMemo } from "react";
import {
  eventsData,
  eventKey,
  getEventDates,
  getEvents,
} from "../../data/events";
import {
  formatEventDateChip,
  formatEventDayHeading,
  isoDateForTripDay,
  tripDayForIsoDate,
} from "../../date";
import {
  countPanelFilters,
  defaultEventFilters,
  filterAndGroupEvents,
  type EventDateFilter,
  type EventFilters,
} from "../../eventFilters";
import PaneTools from "../PaneTools";
import EmptyEventsState from "./EmptyEventsState";
import EventCard from "./EventCard";
import EventsFilters from "./EventsFilters";

interface EventsViewProps {
  itineraryDay: number;
  filters: EventFilters;
  filtersOpen: boolean;
  onChange: (next: EventFilters) => void;
  onToggleFilters: () => void;
}

export default function EventsView({
  itineraryDay,
  filters,
  filtersOpen,
  onChange,
  onToggleFilters,
}: EventsViewProps) {
  const events = getEvents();
  const dates = getEventDates();
  const groups = useMemo(
    () => filterAndGroupEvents(events, filters),
    [events, filters],
  );
  const visibleCount = groups.reduce(
    (total, group) => total + group.events.length,
    0,
  );
  const itineraryDate = isoDateForTripDay(itineraryDay);
  const panelCount = countPanelFilters(filters);
  const { recordCount } = eventsData.meta;

  function resetFilters() {
    onChange(defaultEventFilters(itineraryDate));
  }

  return (
    <section className="pane events-pane" aria-labelledby="events-heading">
      <header className="attractions-header">
        <div className="attractions-heading-row">
          <h1 id="events-heading">Events</h1>
          <p className="muted result-count">
            {visibleCount} of {recordCount}
          </p>
          <PaneTools />
        </div>
        <label className="attractions-search">
          <span className="visually-hidden">Search events</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder="Search name, venue, area"
            autoComplete="off"
          />
        </label>
        <div className="event-date-chips" role="group" aria-label="Event date">
          {(["All", ...dates] as EventDateFilter[]).map((date) => {
            const selected = filters.date === date;
            const dayNumber =
              date === "All" ? undefined : tripDayForIsoDate(date);
            return (
              <button
                key={date}
                type="button"
                className={selected ? "day-chip is-selected" : "day-chip"}
                aria-pressed={selected}
                onClick={() => onChange({ ...filters, date })}
              >
                <span className="day-chip-label">
                  {date === "All"
                    ? "All"
                    : dayNumber !== undefined
                      ? `Day ${dayNumber}`
                      : formatEventDateChip(date)}
                </span>
                <span className="day-chip-date">
                  {date === "All" ? "days" : formatEventDateChip(date)}
                </span>
              </button>
            );
          })}
        </div>
        <EventsFilters
          filters={filters}
          open={filtersOpen}
          activeCount={panelCount}
          onToggle={onToggleFilters}
          onChange={onChange}
          onReset={resetFilters}
        />
      </header>
      {visibleCount === 0 ? (
        <EmptyEventsState onReset={resetFilters} />
      ) : (
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
      )}
    </section>
  );
}
