import { describe, expect, it } from "vitest";
import type { WeatherPlan } from "./types/navigation";
import {
  isSegmentComplete,
  resolveCurrentSegment,
  segmentProgressKey,
  uncompleteFromThrough,
} from "./progress";

const plan: WeatherPlan = {
  weather: "Good",
  segments: [1, 2, 3, 4].map((segmentNumber) => ({
    segmentNumber,
    name: `Segment ${segmentNumber}`,
    mode: "Walking",
    conditional: false,
    notes: "",
    stops: [],
  })),
};

function completedSet(...numbers: number[]): Set<string> {
  return new Set(numbers.map((number) => segmentProgressKey(1, "Good", number)));
}

describe("resolveCurrentSegment", () => {
  it("is the first incomplete segment", () => {
    expect(resolveCurrentSegment(plan, completedSet(), 1, "Good")).toBe(1);
    expect(resolveCurrentSegment(plan, completedSet(1), 1, "Good")).toBe(2);
    expect(resolveCurrentSegment(plan, completedSet(1, 3), 1, "Good")).toBe(2);
  });

  it("stays on the last segment when the plan is finished", () => {
    expect(
      resolveCurrentSegment(plan, completedSet(1, 2, 3, 4), 1, "Good"),
    ).toBe(4);
  });
});

describe("uncompleteFromThrough", () => {
  it("unmarks the undone segment and every completed segment up to the current bar", () => {
    const next = uncompleteFromThrough(
      completedSet(1, 2),
      plan,
      1,
      "Good",
      1,
      3,
    );

    expect(isSegmentComplete(next, 1, "Good", 1)).toBe(false);
    expect(isSegmentComplete(next, 1, "Good", 2)).toBe(false);
    expect(isSegmentComplete(next, 1, "Good", 3)).toBe(false);
    expect(isSegmentComplete(next, 1, "Good", 4)).toBe(false);
  });

  it("leaves later completed segments past the current bar marked done", () => {
    const next = uncompleteFromThrough(
      completedSet(1, 2, 4),
      plan,
      1,
      "Good",
      1,
      3,
    );

    expect(isSegmentComplete(next, 1, "Good", 2)).toBe(false);
    expect(isSegmentComplete(next, 1, "Good", 4)).toBe(true);
  });

  it("only unmarks the undone segment when it is at or after the current bar", () => {
    const next = uncompleteFromThrough(
      completedSet(2, 4),
      plan,
      1,
      "Good",
      4,
      2,
    );

    expect(isSegmentComplete(next, 1, "Good", 2)).toBe(true);
    expect(isSegmentComplete(next, 1, "Good", 4)).toBe(false);
  });
});
