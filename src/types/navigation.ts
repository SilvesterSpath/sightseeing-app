export type Weather = "Good" | "Mixed" | "Heavy rain";

export type TransportMode =
  | "Walking"
  | "Transit"
  | "Boat/Walking"
  | "Transit/Walking"
  | "Walking/Transit";

export type GoCityMarker = "none" | "day-1" | "day-2" | "day-3";

export interface NavigationMeta {
  title: string;
  tripStart: string;
  tripEnd: string;
  baseAddress: string;
  schemaVersion: number;
  sourceWorkbook: string;
}

export interface MasterStop {
  id: string;
  name: string;
  query: string;
  type: string;
  googleMapsSearchUrl: string;
  notes: string;
  sourceUrl: string;
}

export interface SegmentStop {
  order: number;
  stopId: string;
  name: string;
  query: string;
  googleMapsSearchUrl: string;
}

export interface Segment {
  segmentNumber: number;
  name: string;
  mode: TransportMode;
  conditional: boolean;
  notes: string;
  stops: SegmentStop[];
}

export interface WeatherPlan {
  weather: Weather;
  segments: Segment[];
}

export interface DayPlan {
  day: number;
  date: string;
  goCity: GoCityMarker;
  weatherPlans: WeatherPlan[];
}

export interface NavigationData {
  meta: NavigationMeta;
  stops: MasterStop[];
  days: DayPlan[];
}
