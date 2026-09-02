import type { TripEvent } from "./types/events";

export interface EventDayGroup {
  date: string;
  events: TripEvent[];
}

export function compareEvents(a: TripEvent, b: TripEvent): number {
  const dateCmp = a.date.localeCompare(b.date);
  if (dateCmp !== 0) {
    return dateCmp;
  }
  if (a.startTime === null && b.startTime !== null) {
    return 1;
  }
  if (a.startTime !== null && b.startTime === null) {
    return -1;
  }
  if (a.startTime !== null && b.startTime !== null) {
    const timeCmp = a.startTime.localeCompare(b.startTime);
    if (timeCmp !== 0) {
      return timeCmp;
    }
  }
  return a.name.localeCompare(b.name);
}

export function sortEvents(events: readonly TripEvent[]): TripEvent[] {
  return [...events].sort(compareEvents);
}

export function groupEventsByDate(
  events: readonly TripEvent[],
): EventDayGroup[] {
  const groups: EventDayGroup[] = [];
  for (const event of sortEvents(events)) {
    const last = groups[groups.length - 1];
    if (last && last.date === event.date) {
      last.events.push(event);
    } else {
      groups.push({ date: event.date, events: [event] });
    }
  }
  return groups;
}
