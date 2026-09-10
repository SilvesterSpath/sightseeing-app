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

  it("uses one GPS-targeted City Break Parking stop as trip start and end", () => {
    const parking = navigationData.stops.filter(
      (stop) => stop.id === "BUD_CITY_BREAK_PARKING",
    );
    expect(parking).toHaveLength(1);
    expect(parking[0]?.name).toBe("City Break Parking");
    expect(parking[0]?.type).toBe("Parking");
    expect(parking[0]?.query).toBe("47.42969,19.26455");
    expect(parking[0]?.sourceUrl).toBe("");

    const firstStop = navigationData.days[0]?.weatherPlans[0]?.segments[0]
      ?.stops[0]?.stopId;
    const lastPlan = navigationData.days[4]?.weatherPlans[0];
    const lastSegment = lastPlan?.segments[lastPlan.segments.length - 1];
    const lastStop = lastSegment?.stops.at(-1)?.stopId;
    expect(firstStop).toBe("BUD_CITY_BREAK_PARKING");
    expect(lastStop).toBe("BUD_CITY_BREAK_PARKING");
  });
});
