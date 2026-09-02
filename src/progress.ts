import { getPlan, WEATHERS } from "./data/navigation";
import { defaultTripDay, isValidDay } from "./date";
import type { Weather, WeatherPlan } from "./types/navigation";
import {
  readUrlOverrides,
  type AppTab,
  type AppUrlState,
} from "./urlState";

export const PROGRESS_STORAGE_KEY = "sightseeng.progress.v1";

export interface StoredProgress {
  tab: AppTab;
  day: number;
  weather: Weather;
  completed: string[];
  currentByPlan: Record<string, number>;
}

export interface HydratedProgress extends AppUrlState {
  completed: Set<string>;
  currentByPlan: Record<string, number>;
  currentSegmentNumber: number;
}

export function planProgressKey(day: number, weather: Weather): string {
  return `${day}|${weather}`;
}

export function segmentKeyPrefix(day: number, weather: Weather): string {
  return `d${day}|${weather}|s`;
}

export function segmentProgressKey(
  day: number,
  weather: Weather,
  segmentNumber: number,
): string {
  return `${segmentKeyPrefix(day, weather)}${segmentNumber}`;
}

export function isSegmentComplete(
  completed: ReadonlySet<string>,
  day: number,
  weather: Weather,
  segmentNumber: number,
): boolean {
  return completed.has(segmentProgressKey(day, weather, segmentNumber));
}

export function firstIncompleteSegment(
  plan: WeatherPlan | undefined,
  completed: ReadonlySet<string>,
  day: number,
  weather: Weather,
): number | undefined {
  return plan?.segments.find(
    (segment) =>
      !isSegmentComplete(completed, day, weather, segment.segmentNumber),
  )?.segmentNumber;
}

export function resolveCurrentSegment(
  plan: WeatherPlan | undefined,
  completed: ReadonlySet<string>,
  day: number,
  weather: Weather,
  preferred?: number,
): number {
  if (
    preferred !== undefined &&
    plan?.segments.some((segment) => segment.segmentNumber === preferred)
  ) {
    return preferred;
  }

  return (
    firstIncompleteSegment(plan, completed, day, weather) ??
    plan?.segments[0]?.segmentNumber ??
    1
  );
}

function isAppTab(value: unknown): value is AppTab {
  return (
    value === "itinerary" || value === "attractions" || value === "events"
  );
}

function isWeather(value: unknown): value is Weather {
  return (
    typeof value === "string" &&
    (WEATHERS as readonly string[]).includes(value)
  );
}

function parseCurrentByPlan(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const result: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "number" && Number.isInteger(raw) && raw > 0) {
      result[key] = raw;
    }
  }
  return result;
}

function parseCompleted(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.startsWith("d"),
  );
}

export function parseStoredProgress(raw: string): StoredProgress | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const day = typeof record.day === "number" ? record.day : NaN;
    if (!isAppTab(record.tab) || !isValidDay(day) || !isWeather(record.weather)) {
      return null;
    }

    return {
      tab: record.tab,
      day,
      weather: record.weather,
      completed: parseCompleted(record.completed),
      currentByPlan: parseCurrentByPlan(record.currentByPlan),
    };
  } catch {
    return null;
  }
}

function emptyProgress(): StoredProgress {
  return {
    tab: "itinerary",
    day: defaultTripDay(),
    weather: "Good",
    completed: [],
    currentByPlan: {},
  };
}

export function loadProgress(): StoredProgress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return emptyProgress();
    }
    return parseStoredProgress(raw) ?? emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: StoredProgress): void {
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(progress),
    );
  } catch {
    // Private mode or blocked storage must not crash the app.
  }
}

export function hydrateProgress(): HydratedProgress {
  const stored = loadProgress();
  const url = readUrlOverrides();
  const tab = url.tab ?? stored.tab;
  const day = url.day ?? stored.day;
  const weather = url.weather ?? stored.weather;
  const completed = new Set(stored.completed);
  const plan = getPlan(day, weather);
  const currentSegmentNumber = resolveCurrentSegment(
    plan,
    completed,
    day,
    weather,
    stored.currentByPlan[planProgressKey(day, weather)],
  );

  return {
    tab,
    day,
    weather,
    completed,
    currentByPlan: stored.currentByPlan,
    currentSegmentNumber,
  };
}

export function clearPlanProgress(
  completed: ReadonlySet<string>,
  currentByPlan: Record<string, number>,
  day: number,
  weather: Weather,
): { completed: Set<string>; currentByPlan: Record<string, number> } {
  const prefix = segmentKeyPrefix(day, weather);
  const nextCompleted = new Set(
    [...completed].filter((key) => !key.startsWith(prefix)),
  );
  const nextCurrent = { ...currentByPlan };
  delete nextCurrent[planProgressKey(day, weather)];
  return { completed: nextCompleted, currentByPlan: nextCurrent };
}

export function planHasProgress(
  completed: ReadonlySet<string>,
  currentByPlan: Record<string, number>,
  day: number,
  weather: Weather,
  currentSegmentNumber: number,
): boolean {
  const prefix = segmentKeyPrefix(day, weather);
  if ([...completed].some((key) => key.startsWith(prefix))) {
    return true;
  }
  if (planProgressKey(day, weather) in currentByPlan) {
    return currentSegmentNumber !== 1;
  }
  return false;
}
