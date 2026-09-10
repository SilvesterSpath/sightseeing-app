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

  it("uses one shared O'Learys luggage-handoff stop on Day 1 and Day 5", () => {
    const olearys = navigationData.stops.filter((stop) => stop.id === "OLEARYS");
    expect(olearys).toHaveLength(1);
    expect(olearys[0]?.type).toBe("Luggage handoff");
    expect(olearys[0]?.query).toBe(
      "O'Learys Stockholm Central Station, Stockholm, Sweden",
    );

    const daysUsingOlearys = new Set(
      navigationData.days
        .filter((day) =>
          day.weatherPlans.some((plan) =>
            plan.segments.some((segment) =>
              segment.stops.some((stop) => stop.stopId === "OLEARYS"),
            ),
          ),
        )
        .map((day) => day.day),
    );
    expect(daysUsingOlearys).toEqual(new Set([1, 5]));
  });
});
