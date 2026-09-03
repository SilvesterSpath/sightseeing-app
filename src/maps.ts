import type { SegmentStop, TransportMode } from "./types/navigation";

export const MAX_STOPS_PER_DIRECTIONS = 5;
export const MAX_STOPS_PER_TRANSIT = 2;
export const MAPS_URL_MAX_LENGTH = 2048;

export type MapsTravelMode = "walking" | "transit";

export function travelModeFor(
  mode: TransportMode,
): MapsTravelMode | undefined {
  switch (mode) {
    case "Walking":
      return "walking";
    case "Transit":
    case "Transit/Walking":
    case "Walking/Transit":
      return "transit";
    case "Boat/Walking":
      return undefined;
  }
}

export function isTransitFamily(mode: TransportMode): boolean {
  return travelModeFor(mode) === "transit";
}

export function maxStopsPerDirections(mode: TransportMode): number {
  return isTransitFamily(mode) ? MAX_STOPS_PER_TRANSIT : MAX_STOPS_PER_DIRECTIONS;
}

export function needsOpenInParts(
  stops: SegmentStop[],
  mode: TransportMode,
): boolean {
  return stops.length > maxStopsPerDirections(mode);
}

export function chunkStops(
  stops: SegmentStop[],
  mode: TransportMode,
): SegmentStop[][] {
  const max = maxStopsPerDirections(mode);
  if (stops.length <= max) {
    return [stops];
  }

  const chunks: SegmentStop[][] = [];
  let start = 0;

  while (start < stops.length - 1) {
    const end = Math.min(start + max, stops.length);
    chunks.push(stops.slice(start, end));
    if (end === stops.length) {
      break;
    }
    start = end - 1;
  }

  return chunks;
}

export function buildDirectionsUrl(
  stops: SegmentStop[],
  mode: TransportMode,
): string | null {
  if (stops.length < 2) {
    return null;
  }

  const travelmode = travelModeFor(mode);
  if (travelmode === "transit" && stops.length > MAX_STOPS_PER_TRANSIT) {
    return null;
  }

  const origin = stops[0].query;
  const destination = stops[stops.length - 1].query;
  const waypoints =
    travelmode === "transit"
      ? []
      : stops.slice(1, -1).map((stop) => stop.query);

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);

  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints.join("|"));
  }

  if (travelmode) {
    url.searchParams.set("travelmode", travelmode);
  }

  const href = url.toString();
  return href.length > MAPS_URL_MAX_LENGTH ? null : href;
}
