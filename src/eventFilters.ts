import type { TripEvent } from "./types/events";

export type EventDateFilter = "All" | (string & {});
export type IndoorFilter = "All" | "Indoor" | "Outdoor" | "Mixed";
export type EventStatusFilter =
  | "All"
  | "On sale"
  | "Sold out"
  | "Verify time"
  | "Scheduled";

export interface EventFilters {
  search: string;
  date: EventDateFilter;
  category: string;
  area: string;
  indoor: IndoorFilter;
  status: EventStatusFilter;
}

export interface EventDayGroup {
  date: string;
  events: TripEvent[];
}

export const EVENT_STATUS_FILTERS: EventStatusFilter[] = [
  "All",
  "On sale",
  "Sold out",
  "Verify time",
  "Scheduled",
];

export function defaultEventFilters(itineraryDate: string): EventFilters {
  return {
    search: "",
    date: itineraryDate || "All",
    category: "",
    area: "",
    indoor: "All",
    status: "All",
  };
}

export function indoorBucket(
  indoorOutdoor: string,
): Exclude<IndoorFilter, "All"> {
  if (indoorOutdoor === "Indoor") {
    return "Indoor";
  }
  if (indoorOutdoor.startsWith("Mixed")) {
    return "Mixed";
  }
  return "Outdoor";
}

export function getIndoorOptions(
  events: readonly TripEvent[],
): IndoorFilter[] {
  const present = new Set(events.map((event) => indoorBucket(event.indoorOutdoor)));
  const order: IndoorFilter[] = ["All", "Indoor", "Outdoor", "Mixed"];
  return order.filter((option) => option === "All" || present.has(option));
}

export function countPanelFilters(filters: EventFilters): number {
  let count = 0;
  if (filters.category) count += 1;
  if (filters.area) count += 1;
  if (filters.indoor !== "All") count += 1;
  if (filters.status !== "All") count += 1;
  return count;
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

function matchesSearch(event: TripEvent, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack =
    `${event.name} ${event.venue} ${event.area} ${event.category} ${event.notes} ${event.tripFit}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesStatus(event: TripEvent, status: EventStatusFilter): boolean {
  if (status === "All") {
    return true;
  }
  if (status === "Verify time") {
    return event.status.toLowerCase().includes("verify time");
  }
  return event.status === status;
}

function matchesFilters(event: TripEvent, filters: EventFilters): boolean {
  if (filters.date !== "All" && event.date !== filters.date) {
    return false;
  }
  if (!matchesSearch(event, filters.search.trim())) {
    return false;
  }
  if (filters.category && event.category !== filters.category) {
    return false;
  }
  if (filters.area && event.area !== filters.area) {
    return false;
  }
  if (
    filters.indoor !== "All" &&
    indoorBucket(event.indoorOutdoor) !== filters.indoor
  ) {
    return false;
  }
  return matchesStatus(event, filters.status);
}

export function filterAndGroupEvents(
  events: readonly TripEvent[],
  filters: EventFilters,
): EventDayGroup[] {
  return groupEventsByDate(
    events.filter((event) => matchesFilters(event, filters)),
  );
}
