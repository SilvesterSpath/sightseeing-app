export type TripPriority = "Must-see" | "High" | "Medium" | "Low";

export type GoodForRain = "Yes" | "No" | "Partial";

export interface AttractionsMeta {
  title: string;
  tripDates: {
    start: string;
    end: string;
  };
  schemaVersion: number;
  sourceWorkbook: string;
  recordCount: number;
  description: string;
}

export interface Attraction {
  name: string;
  category: string;
  area: string;
  accessType: string;
  goCityAllInclusive: boolean;
  regularAdultPriceSek: number | null;
  indoorOutdoor: string;
  typicalTime: string;
  tripPriority: TripPriority;
  goodForRain: GoodForRain;
  relevantSep11To15: string;
  alreadyInItinerary: boolean;
  addressOrLocation: string;
  googleMapsUrl: string;
  sourceUrl: string;
  notes: string;
}

export interface AttractionsData {
  meta: AttractionsMeta;
  attractions: Attraction[];
}
