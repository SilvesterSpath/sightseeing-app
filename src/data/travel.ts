import rawTravel from "@travel-data";
import type { Segment, SegmentStop, TransportMode } from "../types/navigation";
import type {
  LegMode,
  MixedSequence,
  TravelData,
  TravelLeg,
} from "../types/travel";

const HARBOUR_STOPS = new Set(["STROMKAJEN", "VAXHOLM"]);
const LEG_MODES = ["walking", "transit", "boat"] as const;
const SOURCES = ["manual", "google"] as const;

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}

function sequenceKey(stopIds: string[]): string {
  return stopIds.join(">");
}

function legKey(fromStopId: string, toStopId: string, mode: LegMode): string {
  return `${fromStopId}|${toStopId}|${mode}`;
}

function validateTravel(data: typeof rawTravel): TravelData {
  if (data.schemaVersion !== 1) {
    throw new Error(`Unexpected travel schemaVersion: ${data.schemaVersion}`);
  }

  const mixedKeys = new Set<string>();
  for (const sequence of data.mixedSequences) {
    if (sequence.modes.length !== sequence.stopIds.length - 1) {
      throw new Error(
        `mixedSequence modes length ${sequence.modes.length} != ${sequence.stopIds.length - 1} (${sequence.stopIds.join(">")})`,
      );
    }
    for (const mode of sequence.modes) {
      if (!isOneOf(mode, LEG_MODES)) {
        throw new Error(`Unexpected mixedSequence mode: ${mode}`);
      }
    }
    const key = sequenceKey(sequence.stopIds);
    if (mixedKeys.has(key)) {
      throw new Error(`Duplicate mixedSequence: ${key}`);
    }
    mixedKeys.add(key);
  }

  const keys = new Set<string>();
  for (const leg of data.legs) {
    if (!isOneOf(leg.mode, LEG_MODES)) {
      throw new Error(`Unexpected leg mode: ${leg.mode}`);
    }
    if (!isOneOf(leg.source, SOURCES)) {
      throw new Error(`Unexpected leg source: ${leg.source}`);
    }
    if (!Number.isInteger(leg.durationMinutes) || leg.durationMinutes <= 0) {
      throw new Error(
        `Invalid durationMinutes for ${leg.fromStopId} → ${leg.toStopId}`,
      );
    }
    const key = legKey(leg.fromStopId, leg.toStopId, leg.mode);
    if (keys.has(key)) {
      throw new Error(`Duplicate travel leg: ${key}`);
    }
    keys.add(key);
  }

  return data as TravelData;
}

export const travelData: TravelData = validateTravel(rawTravel);

const mixedBySequence = new Map<string, MixedSequence>(
  travelData.mixedSequences.map((sequence) => [
    sequenceKey(sequence.stopIds),
    sequence,
  ]),
);

const legsByKey = new Map<string, TravelLeg>(
  travelData.legs.map((leg) => [
    legKey(leg.fromStopId, leg.toStopId, leg.mode),
    leg,
  ]),
);

function defaultLegMode(
  segmentMode: TransportMode,
  fromStopId: string,
  toStopId: string,
): LegMode | undefined {
  switch (segmentMode) {
    case "Walking":
      return "walking";
    case "Transit":
      return "transit";
    case "Boat/Walking":
      return HARBOUR_STOPS.has(fromStopId) && HARBOUR_STOPS.has(toStopId)
        ? "boat"
        : "walking";
    case "Transit/Walking":
    case "Walking/Transit":
      return undefined;
  }
}

export function resolveLegMode(
  segment: Segment,
  fromIndex: number,
): LegMode | undefined {
  const from = segment.stops[fromIndex];
  const to = segment.stops[fromIndex + 1];
  if (!from || !to) {
    return undefined;
  }

  const mixed = mixedBySequence.get(
    sequenceKey(segment.stops.map((stop) => stop.stopId)),
  );
  if (mixed) {
    return mixed.modes[fromIndex];
  }

  return defaultLegMode(segment.mode, from.stopId, to.stopId);
}

function findLegIndex(
  stops: SegmentStop[],
  fromStopId: string,
  toStopId: string,
): number {
  return stops.findIndex(
    (stop, index) =>
      stop.stopId === fromStopId && stops[index + 1]?.stopId === toStopId,
  );
}

export function getLegMinutes(
  fromStopId: string,
  toStopId: string,
  mode: LegMode,
): number | undefined {
  const minutes = legsByKey.get(legKey(fromStopId, toStopId, mode))
    ?.durationMinutes;
  return minutes && minutes > 0 ? minutes : undefined;
}

export function segmentLegMinutes(
  segment: Segment,
  fromIndex: number,
): number | undefined {
  const from = segment.stops[fromIndex];
  const to = segment.stops[fromIndex + 1];
  const mode = resolveLegMode(segment, fromIndex);
  if (!from || !to || !mode) {
    return undefined;
  }
  return getLegMinutes(from.stopId, to.stopId, mode);
}

function sumConsecutive(
  segment: Segment,
  stops: SegmentStop[],
): number | undefined {
  if (stops.length < 2) {
    return undefined;
  }

  let total = 0;
  for (let index = 0; index < stops.length - 1; index += 1) {
    const from = stops[index];
    const to = stops[index + 1];
    const parentIndex = findLegIndex(segment.stops, from.stopId, to.stopId);
    const minutes =
      parentIndex >= 0
        ? segmentLegMinutes(segment, parentIndex)
        : undefined;
    if (minutes == null) {
      return undefined;
    }
    total += minutes;
  }
  return total;
}

export function segmentTravelMinutes(segment: Segment): number | undefined {
  return sumConsecutive(segment, segment.stops);
}

export function partTravelMinutes(
  chunk: SegmentStop[],
  segment: Segment,
): number | undefined {
  return sumConsecutive(segment, chunk);
}

export function formatMinutesEstimate(minutes: number): string {
  return `~${minutes} min`;
}

export function legModePhrase(mode: LegMode): string {
  switch (mode) {
    case "walking":
      return "walk";
    case "transit":
      return "transit";
    case "boat":
      return "boat";
  }
}
