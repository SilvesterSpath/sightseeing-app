export interface EventsMeta {
  title: string;
  tripDates: {
    start: string;
    end: string;
  };
  schemaVersion: number;
  recordCount: number;
  researchedAt: string;
  description: string;
  importantNote: string;
}

export interface TripEvent {
  name: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  category: string;
  venue: string;
  area: string;
  addressOrLocation: string;
  indoorOutdoor: string;
  priceSek: number | null;
  status: string;
  language: string;
  tripFit: string;
  alreadyInItinerary: boolean;
  googleMapsUrl: string;
  sourceUrl: string;
  notes: string;
}

export interface EventsData {
  meta: EventsMeta;
  events: TripEvent[];
}
