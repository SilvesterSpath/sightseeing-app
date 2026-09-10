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

  it("covers all 55 segments across 15 weather plans", () => {
    expect(countWeatherPlans()).toBe(15);
    expect(countSegments()).toBe(55);
    expect(plans).toHaveLength(55);
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
      if (needsOpenInParts(segment.stops, segment.mode)) {
        expect(buildDirectionsUrl(segment.stops, segment.mode)).toBeNull();
        const chunks = chunkStops(segment.stops, segment.mode);
        expect(chunks.length).toBe(segment.stops.length - 1);
        for (const chunk of chunks) {
          expect(chunk).toHaveLength(MAX_STOPS_PER_TRANSIT);
        }
      }

      for (const href of openedUrls(segment)) {
        const url = new URL(href);
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
    expect(arrival?.stops.map((stop) => stop.stopId)).toEqual([
      "ARLANDA",
      "MARSTA",
      "STOCKHOLM_C",
    ]);

    const chunks = chunkStops(arrival!.stops, arrival!.mode);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].map((stop) => stop.stopId)).toEqual(["ARLANDA", "MARSTA"]);
    expect(chunks[1].map((stop) => stop.stopId)).toEqual([
      "MARSTA",
      "STOCKHOLM_C",
    ]);

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

  it("splits Day 5 Airport into O'Learys → Märsta, Märsta → Arlanda, and Arlanda → Budapest T2", () => {
    const plan = getPlan(5, "Good");
    const airport = plan?.segments.find(
      (segment) => segment.name === "Airport",
    );
    expect(airport).toBeDefined();
    expect(airport?.mode).toBe("Transit");
    expect(airport?.stops.map((stop) => stop.stopId)).toEqual([
      "OLEARYS",
      "MARSTA",
      "ARLANDA",
      "BUD_T2",
    ]);

    const chunks = chunkStops(airport!.stops, airport!.mode);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].map((stop) => stop.stopId)).toEqual([
      "OLEARYS",
      "MARSTA",
    ]);
    expect(chunks[1].map((stop) => stop.stopId)).toEqual([
      "MARSTA",
      "ARLANDA",
    ]);
    expect(chunks[2].map((stop) => stop.stopId)).toEqual(["ARLANDA", "BUD_T2"]);
  });

  it("splits Day 4 Mixed return from Skansen into pairwise transit, then one walking viewpoint route", () => {
    const plan = getPlan(4, "Mixed");
    expect(plan?.segments.map((segment) => segment.name)).toEqual([
      "Royal cluster",
      "Skansen",
      "Return from Skansen",
      "Viewpoints if clear",
    ]);

    const ferryHome = plan?.segments.find(
      (segment) => segment.name === "Return from Skansen",
    );
    expect(ferryHome?.mode).toBe("Transit");
    expect(ferryHome?.conditional).toBe(false);
    expect(ferryHome?.stops.map((stop) => stop.stopId)).toEqual([
      "SKANSEN",
      "ALLMANNA",
      "SLUSSEN",
    ]);
    expect(buildDirectionsUrl(ferryHome!.stops, ferryHome!.mode)).toBeNull();
    const ferryChunks = chunkStops(ferryHome!.stops, ferryHome!.mode);
    expect(ferryChunks).toHaveLength(2);
    expect(ferryChunks[0].map((stop) => stop.stopId)).toEqual([
      "SKANSEN",
      "ALLMANNA",
    ]);
    expect(ferryChunks[1].map((stop) => stop.stopId)).toEqual([
      "ALLMANNA",
      "SLUSSEN",
    ]);

    const viewpoints = plan?.segments.find(
      (segment) => segment.name === "Viewpoints if clear",
    );
    expect(viewpoints?.mode).toBe("Walking");
    expect(viewpoints?.conditional).toBe(true);
    expect(viewpoints?.stops.map((stop) => stop.stopId)).toEqual([
      "SLUSSEN",
      "FJALL",
      "MONTELIUS",
      "HOTEL",
    ]);
    expect(needsOpenInParts(viewpoints!.stops, viewpoints!.mode)).toBe(false);
    const walkingHref = buildDirectionsUrl(
      viewpoints!.stops,
      viewpoints!.mode,
    );
    expect(walkingHref).toBeTruthy();
    const walkingUrl = new URL(walkingHref as string);
    expect(walkingUrl.searchParams.get("travelmode")).toBe("walking");
    expect(walkingUrl.searchParams.get("waypoints")).toBe(
      [viewpoints!.stops[1].query, viewpoints!.stops[2].query].join("|"),
    );
    expect(walkingUrl.searchParams.has("dir_action")).toBe(false);
  });

  it("uses one walking Maps route for Day 5 Mixed design district", () => {
    const plan = getPlan(5, "Mixed");
    const design = plan?.segments.find(
      (segment) => segment.name === "Design district",
    );
    expect(design?.mode).toBe("Walking");
    expect(design?.stops.map((stop) => stop.stopId)).toEqual([
      "HOTEL",
      "NORD_GALL",
      "NORRGAVEL",
      "OSCAR",
      "STUREPLAN",
      "BIBLIO",
    ]);
    expect(needsOpenInParts(design!.stops, design!.mode)).toBe(true);
    const href = buildDirectionsUrl(design!.stops, design!.mode);
    expect(href).toBeTruthy();
    const url = new URL(href as string);
    expect(url.searchParams.get("travelmode")).toBe("walking");
    expect(url.searchParams.get("waypoints")).toBe(
      design!.stops.slice(1, -1).map((stop) => stop.query).join("|"),
    );
    const chunks = chunkStops(design!.stops, design!.mode);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].map((stop) => stop.stopId)).toEqual([
      "HOTEL",
      "NORD_GALL",
      "NORRGAVEL",
      "OSCAR",
      "STUREPLAN",
    ]);
    expect(chunks[1].map((stop) => stop.stopId)).toEqual([
      "STUREPLAN",
      "BIBLIO",
    ]);
  });

  it("splits Day 5 Heavy rain into transit to Nordiska, then one indoor walking route", () => {
    const plan = getPlan(5, "Heavy rain");
    expect(plan?.segments.map((segment) => segment.name)).toEqual([
      "To Nordiska Galleriet",
      "Indoor design route",
      "Café & luggage",
      "Airport",
      "Budapest parking",
    ]);

    const transit = plan?.segments.find(
      (segment) => segment.name === "To Nordiska Galleriet",
    );
    expect(transit?.mode).toBe("Transit");
    expect(transit?.conditional).toBe(false);
    expect(transit?.stops.map((stop) => stop.stopId)).toEqual([
      "HOTEL",
      "NORD_GALL",
    ]);
    expect(needsOpenInParts(transit!.stops, transit!.mode)).toBe(false);
    const transitHref = buildDirectionsUrl(transit!.stops, transit!.mode);
    expect(transitHref).toBeTruthy();
    const transitUrl = new URL(transitHref as string);
    expect(transitUrl.searchParams.get("travelmode")).toBe("transit");

    const indoor = plan?.segments.find(
      (segment) => segment.name === "Indoor design route",
    );
    expect(indoor?.mode).toBe("Walking");
    expect(indoor?.conditional).toBe(false);
    expect(indoor?.stops.map((stop) => stop.stopId)).toEqual([
      "NORD_GALL",
      "NORRGAVEL",
      "OSCAR",
      "NK",
      "GALLERIAN",
      "IKEA",
    ]);
    expect(needsOpenInParts(indoor!.stops, indoor!.mode)).toBe(true);
    const walkingHref = buildDirectionsUrl(indoor!.stops, indoor!.mode);
    expect(walkingHref).toBeTruthy();
    const walkingUrl = new URL(walkingHref as string);
    expect(walkingUrl.searchParams.get("travelmode")).toBe("walking");
    expect(walkingUrl.searchParams.get("waypoints")).toBe(
      indoor!.stops.slice(1, -1).map((stop) => stop.query).join("|"),
    );
    const chunks = chunkStops(indoor!.stops, indoor!.mode);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].map((stop) => stop.stopId)).toEqual([
      "NORD_GALL",
      "NORRGAVEL",
      "OSCAR",
      "NK",
      "GALLERIAN",
    ]);
    expect(chunks[1].map((stop) => stop.stopId)).toEqual(["GALLERIAN", "IKEA"]);
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
