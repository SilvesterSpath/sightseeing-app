import rawNavigation from "@navigation-data";
import type {
  DayPlan,
  MasterStop,
  NavigationData,
  Weather,
  WeatherPlan,
} from "../types/navigation";

export const WEATHERS = ["Good", "Mixed", "Heavy rain"] as const;
const MODES = [
  "Walking",
  "Transit",
  "Boat/Walking",
  "Transit/Walking",
  "Walking/Transit",
] as const;
const GO_CITY = ["none", "day-1", "day-2", "day-3"] as const;

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}

function validateNavigation(
  data: typeof rawNavigation,
): NavigationData {
  for (const day of data.days) {
    if (!isOneOf(day.goCity, GO_CITY)) {
      throw new Error(`Unexpected goCity value: ${day.goCity}`);
    }
    for (const plan of day.weatherPlans) {
      if (!isOneOf(plan.weather, WEATHERS)) {
        throw new Error(`Unexpected weather value: ${plan.weather}`);
      }
      for (const segment of plan.segments) {
        if (!isOneOf(segment.mode, MODES)) {
          throw new Error(
            `Unexpected transport mode: ${segment.mode} (${segment.name})`,
          );
        }
      }
    }
  }
  return data as NavigationData;
}

export const navigationData: NavigationData = validateNavigation(rawNavigation);

export function getDay(day: number): DayPlan | undefined {
  return navigationData.days.find((entry) => entry.day === day);
}

export function getPlan(
  day: number,
  weather: Weather,
): WeatherPlan | undefined {
  return getDay(day)?.weatherPlans.find((plan) => plan.weather === weather);
}

export function getMasterStop(id: string): MasterStop | undefined {
  return navigationData.stops.find((stop) => stop.id === id);
}

export function countWeatherPlans(): number {
  return navigationData.days.reduce(
    (total, day) => total + day.weatherPlans.length,
    0,
  );
}

export function countSegments(): number {
  return navigationData.days.reduce(
    (total, day) =>
      total +
      day.weatherPlans.reduce(
        (planTotal, plan) => planTotal + plan.segments.length,
        0,
      ),
    0,
  );
}
