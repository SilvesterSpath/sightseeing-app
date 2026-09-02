import { WEATHERS } from "./data/navigation";
import { defaultTripDay, isValidDay } from "./date";
import type { Weather } from "./types/navigation";

export type AppTab = "itinerary" | "attractions" | "events";

export interface AppUrlState {
  tab: AppTab;
  day: number;
  weather: Weather;
}

const TAB_PARAM = "tab";
const DAY_PARAM = "day";
const WEATHER_PARAM = "weather";

export function parseTabParam(value: string | null): AppTab {
  if (value === "attractions" || value === "events") {
    return value;
  }
  return "itinerary";
}

export function parseDayParam(value: string | null): number {
  if (value === null) {
    return defaultTripDay();
  }

  const day = Number(value);
  return isValidDay(day) ? day : 1;
}

export function parseWeatherParam(value: string | null): Weather {
  return WEATHERS.find((weather) => weather === value) ?? "Good";
}

export function readAppUrl(): AppUrlState {
  const params = new URLSearchParams(window.location.search);
  return {
    tab: parseTabParam(params.get(TAB_PARAM)),
    day: parseDayParam(params.get(DAY_PARAM)),
    weather: parseWeatherParam(params.get(WEATHER_PARAM)),
  };
}

export function readUrlOverrides(): Partial<AppUrlState> {
  const params = new URLSearchParams(window.location.search);
  const overrides: Partial<AppUrlState> = {};

  if (params.has(TAB_PARAM)) {
    overrides.tab = parseTabParam(params.get(TAB_PARAM));
  }
  if (params.has(DAY_PARAM)) {
    overrides.day = parseDayParam(params.get(DAY_PARAM));
  }
  if (params.has(WEATHER_PARAM)) {
    overrides.weather = parseWeatherParam(params.get(WEATHER_PARAM));
  }

  return overrides;
}

export function writeAppUrl(state: AppUrlState): void {
  const url = new URL(window.location.href);
  const next = new URLSearchParams(url.search);

  next.set(TAB_PARAM, state.tab);
  next.set(DAY_PARAM, String(state.day));
  next.set(WEATHER_PARAM, state.weather);

  if (next.toString() === url.searchParams.toString()) {
    return;
  }

  url.search = next.toString();
  window.history.replaceState(null, "", url);
}
