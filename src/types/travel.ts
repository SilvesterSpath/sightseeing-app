export type LegMode = "walking" | "transit" | "boat";

export type TravelSource = "manual" | "google";

export interface TravelLeg {
  fromStopId: string;
  toStopId: string;
  mode: LegMode;
  durationMinutes: number;
  distanceMeters?: number;
  source: TravelSource;
  notes?: string;
}

export interface MixedSequence {
  stopIds: string[];
  modes: LegMode[];
}

export interface TravelData {
  schemaVersion: number;
  mixedSequences: MixedSequence[];
  legs: TravelLeg[];
}
