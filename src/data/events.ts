import rawEvents from "@events-data";
import type { EventsData, TripEvent } from "../types/events";

const TIME = /^\d{2}:\d{2}$/;

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function validateEvents(data: typeof rawEvents): EventsData {
  const { start, end } = data.meta.tripDates;
  const keys = new Set<string>();

  if (data.meta.recordCount !== data.events.length) {
    throw new Error(
      `Events recordCount ${data.meta.recordCount} does not match ${data.events.length} rows`,
    );
  }

  for (const item of data.events) {
    if (item.date < start || item.date > end) {
      throw new Error(`Event date outside trip window: ${item.date} (${item.name})`);
    }
    if (item.startTime !== null && !TIME.test(item.startTime)) {
      throw new Error(
        `Unexpected startTime: ${item.startTime} (${item.name})`,
      );
    }
    if (item.endTime !== null && !TIME.test(item.endTime)) {
      throw new Error(`Unexpected endTime: ${item.endTime} (${item.name})`);
    }
    const key = eventKey(item);
    if (keys.has(key)) {
      throw new Error(`Duplicate event: ${key}`);
    }
    keys.add(key);
  }

  return data as EventsData;
}

export const eventsData: EventsData = validateEvents(rawEvents);

export function eventKey(event: Pick<TripEvent, "date" | "name">): string {
  return `${event.date}::${event.name}`;
}

export function getEvents(): TripEvent[] {
  return eventsData.events;
}

export function getEventAreas(): string[] {
  return uniqueSorted(eventsData.events.map((item) => item.area));
}

export function getEventDates(): string[] {
  return uniqueSorted(eventsData.events.map((item) => item.date));
}

export function getEventCategories(): string[] {
  return uniqueSorted(eventsData.events.map((item) => item.category));
}
