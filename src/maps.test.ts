import { describe, expect, it } from "vitest";
import {
  countSegments,
  countWeatherPlans,
  getPlan,
  navigationData,
} from "./data/navigation";
import {
  buildDirectionsUrl,
  chunkStops,
  isTransitFamily,
  MAPS_URL_MAX_LENGTH,
  MAX_STOPS_PER_DIRECTIONS,
  MAX_STOPS_PER_TRANSIT,
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

function openedUrls(segment: Segment): string[] {
  if (needsOpenInParts(segment.stops, segment.mode)) {
    if (isTransitFamily(segment.mode)) {
      return chunkStops(segment.stops, segment.mode).flatMap((chunk) => {
        const href = buildDirectionsUrl(chunk, segment.mode);
        return href ? [href] : [];
      });
    }
  }

  const combined = buildDirectionsUrl(segment.stops, segment.mode);
  const extras =
    needsOpenInParts(segment.stops, segment.mode) &&
    !isTransitFamily(segment.mode)
      ? chunkStops(segment.stops, segment.mode).flatMap((chunk) => {
          const href = buildDirectionsUrl(chunk, segment.mode);
          return href ? [href] : [];
        })
      : [];

  return combined ? [combined, ...extras] : extras;
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
      const hrefs = openedUrls(segment);
      expect(
        hrefs.length,
        `Day ${day} ${weather} · ${segment.name}`,
      ).toBeGreaterThan(0);

      for (const href of hrefs) {
        const url = new URL(href);
        expect(url.origin + url.pathname).toBe(
          "https://www.google.com/maps/dir/",
        );
        expect(url.searchParams.get("api")).toBe("1");
        expect(url.searchParams.has("dir_action")).toBe(false);
        expect(href.length).toBeLessThanOrEqual(MAPS_URL_MAX_LENGTH);

        const expectedMode = travelModeFor(segment.mode);
        if (expectedMode) {
          expect(url.searchParams.get("travelmode")).toBe(expectedMode);
        } else {
          expect(url.searchParams.has("travelmode")).toBe(false);
        }
      }
    }
  });

  it("never puts waypoints on transit-family URLs", () => {
    for (const { segment } of plans.filter(({ segment }) =>
      isTransitFamily(segment.mode),
    )) {
      expect(buildDirectionsUrl(segment.stops, segment.mode)).toBeNull();
      const chunks = chunkStops(segment.stops, segment.mode);
      expect(chunks.length).toBe(segment.stops.length - 1);
      for (const chunk of chunks) {
        expect(chunk).toHaveLength(MAX_STOPS_PER_TRANSIT);
        const href = buildDirectionsUrl(chunk, segment.mode);
        expect(href).toBeTruthy();
        const url = new URL(href as string);
        expect(url.searchParams.get("travelmode")).toBe("transit");
        expect(url.searchParams.has("waypoints")).toBe(false);
        expect(url.searchParams.has("dir_action")).toBe(false);
      }
    }
  });

  it("splits Arrival into two transit URLs with no waypoints", () => {
    const plan = getPlan(1, "Good");
    const arrival = plan?.segments.find(
      (segment) => segment.name === "Arrival",
    );
    expect(arrival).toBeDefined();
    expect(arrival?.mode).toBe("Transit");
    expect(arrival?.stops).toHaveLength(3);

    const chunks = chunkStops(arrival!.stops, arrival!.mode);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].map((stop) => stop.stopId)).toEqual(["ARLANDA", "MARSTA"]);
    expect(chunks[1].map((stop) => stop.stopId)).toEqual(["MARSTA", "HOTEL"]);

    const urls = chunks.map((chunk) =>
      buildDirectionsUrl(chunk, arrival!.mode),
    );
    expect(urls[0]).toBeTruthy();
    expect(urls[1]).toBeTruthy();

    for (const href of urls) {
      const url = new URL(href as string);
      expect(url.searchParams.get("travelmode")).toBe("transit");
      expect(url.searchParams.has("waypoints")).toBe(false);
      expect(url.searchParams.has("dir_action")).toBe(false);
    }

    expect(new URL(urls[0] as string).searchParams.get("origin")).toBe(
      arrival!.stops[0].query,
    );
    expect(new URL(urls[0] as string).searchParams.get("destination")).toBe(
      arrival!.stops[1].query,
    );
    expect(new URL(urls[1] as string).searchParams.get("origin")).toBe(
      arrival!.stops[1].query,
    );
    expect(new URL(urls[1] as string).searchParams.get("destination")).toBe(
      arrival!.stops[2].query,
    );
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

  it("keeps walking multi-stop routes on walking with waypoints", () => {
    const walking = plans.filter(
      ({ segment }) =>
        segment.mode === "Walking" && segment.stops.length >= 3,
    );
    expect(walking.length).toBeGreaterThan(0);

    for (const { segment } of walking) {
      const href = buildDirectionsUrl(segment.stops, segment.mode);
      expect(href).toBeTruthy();
      const url = new URL(href as string);
      expect(url.searchParams.get("travelmode")).toBe("walking");
      expect(url.searchParams.has("dir_action")).toBe(false);
      const middle = segment.stops.slice(1, -1).map((stop) => stop.query);
      expect(url.searchParams.get("waypoints")).toBe(middle.join("|"));
    }
  });

  it("splits walking and boat segments with more than 5 stops into overlapping parts", () => {
    const longSegments = plans.filter(
      ({ segment }) =>
        !isTransitFamily(segment.mode) &&
        needsOpenInParts(segment.stops, segment.mode),
    );
    expect(longSegments.length).toBeGreaterThan(0);

    for (const { segment } of longSegments) {
      expect(segment.stops.length).toBeGreaterThan(MAX_STOPS_PER_DIRECTIONS);
      const chunks = chunkStops(segment.stops, segment.mode);
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
