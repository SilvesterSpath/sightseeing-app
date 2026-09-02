import { describe, expect, it } from "vitest";
import { statusBadges } from "./components/events/EventBadges";
import { eventPriceLabel } from "./components/events/EventCard";
import {
  eventKey,
  eventsData,
  getEventAreas,
  getEventCategories,
  getEvents,
} from "./data/events";
import {
  defaultEventFilters,
  filterAndGroupEvents,
  groupEventsByDate,
} from "./eventFilters";

function flatten(
  groups: ReturnType<typeof filterAndGroupEvents>,
) {
  return groups.flatMap((group) => group.events);
}

describe("events catalogue", () => {
  const events = getEvents();

  it("matches meta.recordCount of 20", () => {
    expect(eventsData.meta.recordCount).toBe(20);
    expect(events).toHaveLength(20);
    expect(eventsData.meta.recordCount).toBe(events.length);
  });

  it("keeps every date inside 2026-09-11 to 2026-09-15", () => {
    for (const event of events) {
      expect(event.date >= "2026-09-11").toBe(true);
      expect(event.date <= "2026-09-15").toBe(true);
    }
    expect(new Set(events.map((event) => event.date))).toEqual(
      new Set([
        "2026-09-11",
        "2026-09-12",
        "2026-09-13",
        "2026-09-14",
        "2026-09-15",
      ]),
    );
  });

  it("uses unique date::name keys so duplicate names do not collide", () => {
    const keys = events.map(eventKey);
    expect(keys).toHaveLength(new Set(keys).size);
    const slutspelat = events.filter((event) =>
      event.name.startsWith("Slutspelat"),
    );
    expect(slutspelat).toHaveLength(2);
    expect(eventKey(slutspelat[0])).not.toBe(eventKey(slutspelat[1]));
  });

  it("uses Google Maps search URLs and http(s) source URLs", () => {
    for (const event of events) {
      expect(event.googleMapsUrl.startsWith("https://www.google.com/maps")).toBe(
        true,
      );
      expect(/^https?:\/\//.test(event.sourceUrl)).toBe(true);
    }
  });

  it("hides null priceSek and shows numeric prices", () => {
    const withPrice = events.find((event) => typeof event.priceSek === "number");
    const withoutPrice = events.find((event) => event.priceSek === null);
    expect(withPrice).toBeDefined();
    expect(withoutPrice).toBeDefined();
    expect(eventPriceLabel(withPrice?.priceSek ?? null)).toBe(
      `${withPrice?.priceSek} SEK`,
    );
    expect(eventPriceLabel(null)).toBeNull();
  });

  it("shows Sold out on MAMMA MIA", () => {
    const mammaMia = events.find((event) => event.name.startsWith("MAMMA MIA"));
    expect(mammaMia?.status).toBe("Sold out");
    expect(statusBadges(mammaMia?.status ?? "")).toEqual(["Sold out"]);
  });
});

describe("event filters", () => {
  const events = getEvents();

  it("groups by date and sorts timed rows before null startTimes", () => {
    const groups = groupEventsByDate(events);
    expect(groups.map((group) => group.date)).toEqual([
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
      "2026-09-14",
      "2026-09-15",
    ]);

    const sep14 = groups.find((group) => group.date === "2026-09-14");
    expect(sep14?.events.map((event) => event.name)).toEqual([
      "Slutspelat – Ett komiskt sorgearbete",
      "Daniel Lanois",
      "OCT",
      "The Bad Plus — Farewell Tour",
    ]);
    expect(sep14?.events[0].startTime).toBe("18:30");
    expect(sep14?.events.slice(1).every((event) => event.startTime === null)).toBe(
      true,
    );
  });

  it("shows all 20 with All, six rows on Day 1, and Sep 15 conflicts", () => {
    const all = flatten(filterAndGroupEvents(events, defaultEventFilters("All")));
    expect(all).toHaveLength(20);

    const day1 = flatten(
      filterAndGroupEvents(events, defaultEventFilters("2026-09-11")),
    );
    expect(day1).toHaveLength(6);
    expect(day1.every((event) => event.date === "2026-09-11")).toBe(true);

    const sep15 = flatten(
      filterAndGroupEvents(events, defaultEventFilters("2026-09-15")),
    );
    expect(sep15).toHaveLength(4);
    expect(
      sep15.some((event) => event.tripFit.startsWith("Not feasible")),
    ).toBe(true);
    expect(
      sep15.some((event) => event.tripFit.startsWith("Not recommended")),
    ).toBe(true);
  });

  it("matches fasching case-insensitively on venue", () => {
    const matches = flatten(
      filterAndGroupEvents(events, {
        ...defaultEventFilters("All"),
        search: "fasching",
      }),
    );
    expect(matches).toHaveLength(3);
    expect(matches.every((event) => event.venue === "Fasching")).toBe(true);
  });

  it("ANDs search, date, and secondary filters", () => {
    const soldOut = flatten(
      filterAndGroupEvents(events, {
        ...defaultEventFilters("All"),
        status: "Sold out",
      }),
    );
    expect(soldOut).toHaveLength(1);
    expect(soldOut[0].name).toContain("MAMMA MIA");

    const soldOutAndMixed = flatten(
      filterAndGroupEvents(events, {
        ...defaultEventFilters("All"),
        status: "Sold out",
        indoor: "Mixed",
      }),
    );
    expect(soldOutAndMixed).toHaveLength(0);

    const faschingFriday = flatten(
      filterAndGroupEvents(events, {
        ...defaultEventFilters("2026-09-11"),
        search: "FASCHING",
      }),
    );
    expect(faschingFriday).toHaveLength(1);
    expect(faschingFriday[0].name).toBe("Simone Moreno");
  });

  it("derives sorted category and area options from JSON", () => {
    const areas = getEventAreas();
    const categories = getEventCategories();
    expect(areas.length).toBeGreaterThan(0);
    expect(categories.length).toBeGreaterThan(0);
    expect(areas).toEqual([...areas].sort((a, b) => a.localeCompare(b)));
    expect(categories).toEqual(
      [...categories].sort((a, b) => a.localeCompare(b)),
    );
    expect(new Set(events.map((event) => event.area)).size).toBe(areas.length);
    expect(new Set(events.map((event) => event.category)).size).toBe(
      categories.length,
    );
  });
});
