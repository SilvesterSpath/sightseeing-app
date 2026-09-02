import { describe, expect, it } from "vitest";
import {
  countSegments,
  countWeatherPlans,
  navigationData,
} from "./data/navigation";
import {
  buildDirectionsUrl,
  chunkStops,
  MAPS_URL_MAX_LENGTH,
  MAX_STOPS_PER_DIRECTIONS,
  needsOpenInParts,
  travelModeFor,
} from "./maps";
import type { Segment, Weather } from "./types/navigation";

interface PlanSegment {
  day: number;
  weather: Weather;
  segment: Segment;
}

function allPlanSegments(): PlanSegment[] {
  return navigationData.days.flatMap((day) =>
    day.weatherPlans.flatMap((plan) =>
      plan.segments.map((segment) => ({
        day: day.day,
        weather: plan.weather,
        segment,
      })),
    ),
  );
}

describe("itinerary directions URLs", () => {
  const plans = allPlanSegments();

  it("covers all 47 segments across 15 weather plans", () => {
    expect(countWeatherPlans()).toBe(15);
    expect(countSegments()).toBe(47);
    expect(plans).toHaveLength(47);
  });

  it("builds a parseable dir URL for every segment", () => {
    for (const { day, weather, segment } of plans) {
      const href = buildDirectionsUrl(segment.stops, segment.mode);
      expect(
        href,
        `Day ${day} ${weather} · ${segment.name}`,
      ).toBeTruthy();

      const url = new URL(href as string);
      expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
      expect(url.searchParams.get("api")).toBe("1");
      expect(url.searchParams.has("dir_action")).toBe(false);
      expect(url.searchParams.get("origin")).toBe(segment.stops[0].query);
      expect(url.searchParams.get("destination")).toBe(
        segment.stops[segment.stops.length - 1].query,
      );
      expect((href as string).length).toBeLessThanOrEqual(MAPS_URL_MAX_LENGTH);

      const middle = segment.stops.slice(1, -1).map((stop) => stop.query);
      if (middle.length > 0) {
        expect(url.searchParams.get("waypoints")).toBe(middle.join("|"));
      } else {
        expect(url.searchParams.has("waypoints")).toBe(false);
      }

      const expectedMode = travelModeFor(segment.mode);
      if (expectedMode) {
        expect(url.searchParams.get("travelmode")).toBe(expectedMode);
      } else {
        expect(url.searchParams.has("travelmode")).toBe(false);
      }
    }
  });

  it("maps Walking to walking and transit mixes to transit", () => {
    expect(travelModeFor("Walking")).toBe("walking");
    expect(travelModeFor("Transit")).toBe("transit");
    expect(travelModeFor("Transit/Walking")).toBe("transit");
    expect(travelModeFor("Walking/Transit")).toBe("transit");
    expect(travelModeFor("Boat/Walking")).toBeUndefined();
  });

  it("omits travelmode on Boat/Walking segments", () => {
    const boatSegments = plans.filter(
      ({ segment }) => segment.mode === "Boat/Walking",
    );
    expect(boatSegments.length).toBeGreaterThan(0);
    for (const { segment } of boatSegments) {
      const href = buildDirectionsUrl(segment.stops, segment.mode);
      expect(href).toBeTruthy();
      const url = new URL(href as string);
      expect(url.searchParams.has("travelmode")).toBe(false);
    }
  });

  it("splits segments with more than 5 stops into overlapping parts", () => {
    const longSegments = plans.filter(({ segment }) =>
      needsOpenInParts(segment.stops),
    );
    expect(longSegments.length).toBeGreaterThan(0);

    for (const { segment } of longSegments) {
      expect(segment.stops.length).toBeGreaterThan(MAX_STOPS_PER_DIRECTIONS);
      const chunks = chunkStops(segment.stops);
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0][0]).toEqual(segment.stops[0]);
      expect(chunks[chunks.length - 1].at(-1)).toEqual(segment.stops.at(-1));

      for (const chunk of chunks) {
        expect(chunk.length).toBeLessThanOrEqual(MAX_STOPS_PER_DIRECTIONS);
        expect(chunk.length).toBeGreaterThanOrEqual(2);
        const href = buildDirectionsUrl(chunk, segment.mode);
        expect(href).toBeTruthy();
      }

      for (let index = 1; index < chunks.length; index += 1) {
        expect(chunks[index][0]).toEqual(chunks[index - 1].at(-1));
      }
    }
  });
});
