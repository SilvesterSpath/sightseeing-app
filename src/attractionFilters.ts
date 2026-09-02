import {
  getAccessLabel,
  type AccessLabel,
} from "./data/attractions";
import type { Attraction, TripPriority } from "./types/attractions";

export type AccessFilter = "All" | AccessLabel;
export type TripStatusFilter = "All" | "In itinerary" | "Not in itinerary";
export type RainFilter = "All" | "Good for rain" | "Outdoor";
export type PriorityFilter = "All" | TripPriority;
export type AttractionSort = "recommended" | "name" | "area";

export interface AttractionFilters {
  search: string;
  access: AccessFilter;
  tripStatus: TripStatusFilter;
  rain: RainFilter;
  priority: PriorityFilter;
  area: string;
  category: string;
  sort: AttractionSort;
}

export const DEFAULT_ATTRACTION_FILTERS: AttractionFilters = {
  search: "",
  access: "All",
  tripStatus: "All",
  rain: "All",
  priority: "All",
  area: "",
  category: "",
  sort: "recommended",
};

const PRIORITY_RANK: Record<TripPriority, number> = {
  "Must-see": 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function countPanelFilters(filters: AttractionFilters): number {
  let count = 0;
  if (filters.tripStatus !== "All") count += 1;
  if (filters.rain !== "All") count += 1;
  if (filters.priority !== "All") count += 1;
  if (filters.area) count += 1;
  if (filters.category) count += 1;
  return count;
}

function matchesSearch(item: Attraction, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack =
    `${item.name} ${item.area} ${item.category} ${item.notes}`.toLowerCase();
  return haystack.includes(query);
}

function matchesFilters(item: Attraction, filters: AttractionFilters): boolean {
  if (filters.access !== "All" && getAccessLabel(item) !== filters.access) {
    return false;
  }
  if (filters.tripStatus === "In itinerary" && !item.alreadyInItinerary) {
    return false;
  }
  if (filters.tripStatus === "Not in itinerary" && item.alreadyInItinerary) {
    return false;
  }
  if (filters.rain === "Good for rain" && item.goodForRain !== "Yes") {
    return false;
  }
  if (filters.rain === "Outdoor" && item.goodForRain !== "No") {
    return false;
  }
  if (filters.priority !== "All" && item.tripPriority !== filters.priority) {
    return false;
  }
  if (filters.area && item.area !== filters.area) {
    return false;
  }
  if (filters.category && item.category !== filters.category) {
    return false;
  }
  return matchesSearch(item, filters.search.trim().toLowerCase());
}

function compareAttractions(
  a: Attraction,
  b: Attraction,
  sort: AttractionSort,
): number {
  if (sort === "name") {
    return a.name.localeCompare(b.name);
  }
  if (sort === "area") {
    return a.area.localeCompare(b.area) || a.name.localeCompare(b.name);
  }
  return (
    PRIORITY_RANK[a.tripPriority] - PRIORITY_RANK[b.tripPriority] ||
    a.name.localeCompare(b.name)
  );
}

export function filterAndSortAttractions(
  items: Attraction[],
  filters: AttractionFilters,
): Attraction[] {
  return items
    .filter((item) => matchesFilters(item, filters))
    .sort((a, b) => compareAttractions(a, b, filters.sort));
}
