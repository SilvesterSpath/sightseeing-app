import rawAttractions from "@attractions-data";
import type {
  Attraction,
  AttractionsData,
} from "../types/attractions";

const PRIORITIES = ["Must-see", "High", "Medium", "Low"] as const;
const RAIN = ["Yes", "No", "Partial"] as const;

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}

function validateAttractions(
  data: typeof rawAttractions,
): AttractionsData {
  const names = new Set<string>();

  for (const item of data.attractions) {
    if (!isOneOf(item.tripPriority, PRIORITIES)) {
      throw new Error(
        `Unexpected tripPriority: ${item.tripPriority} (${item.name})`,
      );
    }
    if (!isOneOf(item.goodForRain, RAIN)) {
      throw new Error(
        `Unexpected goodForRain: ${item.goodForRain} (${item.name})`,
      );
    }
    if (names.has(item.name)) {
      throw new Error(`Duplicate attraction name: ${item.name}`);
    }
    names.add(item.name);
  }

  return data as AttractionsData;
}

export const attractionsData: AttractionsData =
  validateAttractions(rawAttractions);

export function getAttractions(): Attraction[] {
  return attractionsData.attractions;
}

export type AccessLabel = "Free" | "Go City" | "Paid";

export function getAccessLabel(item: Attraction): AccessLabel | null {
  if (item.goCityAllInclusive) {
    return "Go City";
  }
  if (item.accessType.startsWith("Free")) {
    return "Free";
  }
  if (item.accessType === "Paid – outside Go City") {
    return "Paid";
  }
  return null;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export function getAreas(): string[] {
  return uniqueSorted(attractionsData.attractions.map((item) => item.area));
}

export function getCategories(): string[] {
  return uniqueSorted(
    attractionsData.attractions.map((item) => item.category),
  );
}
