import { describe, expect, it } from "vitest";
import { getMasterStop, navigationData } from "./data/navigation";

describe("itinerary stop meta", () => {
  it("gives every listed stop a short type from the master list", () => {
    const stopIds = new Set(
      navigationData.days.flatMap((day) =>
        day.weatherPlans.flatMap((plan) =>
          plan.segments.flatMap((segment) =>
            segment.stops.map((stop) => stop.stopId),
          ),
        ),
      ),
    );

    for (const stopId of stopIds) {
      const master = getMasterStop(stopId);
      expect(master, stopId).toBeDefined();
      const words = master?.type.trim().split(/\s+/) ?? [];
      expect(words.length, `${stopId} type`).toBeGreaterThan(0);
      expect(words.length, `${stopId} type`).toBeLessThanOrEqual(3);
    }
  });
});
