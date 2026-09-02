import { describe, expect, it } from "vitest";
import {
  DEFAULT_ATTRACTION_FILTERS,
  filterAndSortAttractions,
} from "./attractionFilters";
import {
  getAccessLabel,
  getAreas,
  getAttractions,
  getCategories,
} from "./data/attractions";

describe("attraction filters", () => {
  const attractions = getAttractions();

  it("starts from the full catalogue of 137", () => {
    expect(attractions).toHaveLength(137);
    expect(
      filterAndSortAttractions(attractions, DEFAULT_ATTRACTION_FILTERS),
    ).toHaveLength(137);
  });

  it("maps access labels without calling Go City free", () => {
    const counts = { Free: 0, "Go City": 0, Paid: 0, leftover: 0 };
    for (const item of attractions) {
      const label = getAccessLabel(item);
      if (label === "Go City") {
        expect(item.goCityAllInclusive).toBe(true);
        expect(item.accessType.startsWith("Free")).toBe(false);
        counts["Go City"] += 1;
      } else if (label) {
        counts[label] += 1;
      } else {
        counts.leftover += 1;
      }
    }
    expect(counts.Free).toBe(50);
    expect(counts["Go City"]).toBe(68);
    expect(counts.Paid).toBe(7);
    expect(counts.leftover).toBe(12);
  });

  it("filters in-itinerary, rain, and JSON-derived area/category", () => {
    expect(
      filterAndSortAttractions(attractions, {
        ...DEFAULT_ATTRACTION_FILTERS,
        tripStatus: "In itinerary",
      }),
    ).toHaveLength(38);
    expect(
      filterAndSortAttractions(attractions, {
        ...DEFAULT_ATTRACTION_FILTERS,
        access: "Go City",
      }),
    ).toHaveLength(68);
    expect(
      filterAndSortAttractions(attractions, {
        ...DEFAULT_ATTRACTION_FILTERS,
        rain: "Good for rain",
      }).every((item) => item.goodForRain === "Yes"),
    ).toBe(true);
    expect(
      filterAndSortAttractions(attractions, {
        ...DEFAULT_ATTRACTION_FILTERS,
        rain: "Outdoor",
      }).every((item) => item.goodForRain === "No"),
    ).toBe(true);

    const areas = getAreas();
    const categories = getCategories();
    expect(areas).toHaveLength(41);
    expect(categories).toHaveLength(81);
    expect(areas).toEqual([...areas].sort((a, b) => a.localeCompare(b)));
    expect(
      filterAndSortAttractions(attractions, {
        ...DEFAULT_ATTRACTION_FILTERS,
        area: "Djurgården",
      }),
    ).toHaveLength(14);
  });

  it("matches search case-insensitively and ANDs with other filters", () => {
    const vasa = filterAndSortAttractions(attractions, {
      ...DEFAULT_ATTRACTION_FILTERS,
      search: "VASA",
    });
    expect(vasa.map((item) => item.name)).toContain("Vasa Museum");
    expect(vasa).toHaveLength(6);

    const goCityVasa = filterAndSortAttractions(attractions, {
      ...DEFAULT_ATTRACTION_FILTERS,
      search: "vasa",
      access: "Go City",
    });
    expect(goCityVasa).toHaveLength(3);
    expect(goCityVasa.every((item) => item.goCityAllInclusive)).toBe(true);
  });

  it("sorts Recommended as Must-see then High then name", () => {
    const sorted = filterAndSortAttractions(attractions, {
      ...DEFAULT_ATTRACTION_FILTERS,
      sort: "recommended",
    });
    const firstHigh = sorted.findIndex((item) => item.tripPriority === "High");
    const lastMustSee = sorted.reduce(
      (last, item, index) => (item.tripPriority === "Must-see" ? index : last),
      -1,
    );
    expect(lastMustSee).toBeGreaterThanOrEqual(0);
    expect(firstHigh).toBeGreaterThan(lastMustSee);
    expect(sorted[0].name.localeCompare(sorted[1].name)).toBeLessThanOrEqual(0);
  });
});
