import { describe, expect, it } from "vitest";
import { navigationData } from "./data/navigation";
import {
  partTravelMinutes,
  resolveLegMode,
  segmentLegMinutes,
  segmentTravelMinutes,
  travelData,
} from "./data/travel";
import { chunkStops, needsOpenInParts } from "./maps";
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

const UNRESOLVED_PAIRS = new Set([
  "STOCKHOLM_C|OLEARYS",
  "OLEARYS|HOTEL",
  "EVERT|OLEARYS",
  "CAFE_GAMLA|OLEARYS",
  "OLEARYS|MARSTA",
  "BUD_T2|ARLANDA",
  "ARLANDA|BUD_T2",
]);

function pairKey(fromStopId: string, toStopId: string): string {
  return `${fromStopId}|${toStopId}`;
}

describe("baked travel times", () => {
  const plans = allPlanSegments();

  it("resolves a positive duration for verified pairs and leaves new handoff pairs open", () => {
    for (const { day, weather, segment } of plans) {
      expect(
        resolveLegMode(segment, 0),
        `Day ${day} ${weather} · ${segment.name} missing mixedSequence/mode`,
      ).toBeDefined();

      for (let index = 0; index < segment.stops.length - 1; index += 1) {
        const minutes = segmentLegMinutes(segment, index);
        const from = segment.stops[index];
        const to = segment.stops[index + 1];
        const key = pairKey(from.stopId, to.stopId);
        const label = `Day ${day} ${weather} · ${segment.name}: ${from.stopId} → ${to.stopId}`;

        if (UNRESOLVED_PAIRS.has(key)) {
          expect(minutes, label).toBeUndefined();
          continue;
        }

        expect(minutes, label).toBeGreaterThan(0);
        expect(Number.isInteger(minutes)).toBe(true);
      }
    }
  });

  it("makes segment totals equal the sum of legs when every leg is known", () => {
    for (const { segment } of plans) {
      let sum = 0;
      let complete = true;
      for (let index = 0; index < segment.stops.length - 1; index += 1) {
        const minutes = segmentLegMinutes(segment, index);
        if (minutes == null) {
          complete = false;
          break;
        }
        sum += minutes;
      }
      if (complete) {
        expect(segmentTravelMinutes(segment)).toBe(sum);
      } else {
        expect(segmentTravelMinutes(segment)).toBeUndefined();
      }
    }
  });

  it("makes Maps part totals equal the legs inside chunkStops()", () => {
    for (const { segment } of plans) {
      if (!needsOpenInParts(segment.stops, segment.mode)) {
        continue;
      }
      const chunks = chunkStops(segment.stops, segment.mode);
      let complete = true;
      const partSum = chunks.reduce((total, chunk) => {
        const minutes = partTravelMinutes(chunk, segment);
        if (minutes == null) {
          complete = false;
          return total;
        }
        expect(minutes).toBeGreaterThan(0);
        return total + minutes;
      }, 0);
      if (complete) {
        expect(partSum).toBe(segmentTravelMinutes(segment));
      } else {
        expect(segmentTravelMinutes(segment)).toBeUndefined();
      }
    }
  });

  it("keeps walking times in a sane band", () => {
    for (const { segment } of plans) {
      for (let index = 0; index < segment.stops.length - 1; index += 1) {
        if (resolveLegMode(segment, index) !== "walking") {
          continue;
        }
        const minutes = segmentLegMinutes(segment, index);
        if (minutes == null) {
          continue;
        }
        expect(minutes).toBeGreaterThanOrEqual(2);
        expect(minutes).toBeLessThanOrEqual(30);
      }
    }
  });

  it("uses boat times for Vaxholm harbour crossings", () => {
    const boat = plans.find(
      ({ segment }) => segment.name === "Archipelago & Vaxholm",
    );
    expect(boat).toBeDefined();
    expect(resolveLegMode(boat!.segment, 0)).toBe("boat");
    expect(segmentLegMinutes(boat!.segment, 0)).toBe(75);
  });

  it("does not store zero or duplicate legs", () => {
    const keys = new Set<string>();
    for (const leg of travelData.legs) {
      expect(leg.durationMinutes).toBeGreaterThan(0);
      const key = `${leg.fromStopId}|${leg.toStopId}|${leg.mode}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });

  it("does not store phone numbers in travel or navigation data", () => {
    const blob = `${JSON.stringify(travelData)}${JSON.stringify(navigationData)}`;
    expect(blob).not.toMatch(/tel:/i);
    expect(blob).not.toMatch(/\+46/);
    expect(blob).not.toMatch(/@/);
    expect(blob).not.toMatch(/licence plate|license plate|booking reference/i);
  });
});
