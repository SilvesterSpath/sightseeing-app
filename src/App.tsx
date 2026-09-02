import { useEffect, useMemo, useState } from "react";
import AppTabs from "./components/AppTabs";
import AttractionsView from "./components/attractions/AttractionsView";
import CurrentSegmentBar from "./components/itinerary/CurrentSegmentBar";
import ItineraryView from "./components/itinerary/ItineraryView";
import {
  DEFAULT_ATTRACTION_FILTERS,
  type AttractionFilters,
} from "./attractionFilters";
import { getPlan } from "./data/navigation";
import type { Weather } from "./types/navigation";
import { readAppUrl, writeAppUrl, type AppTab } from "./urlState";

export default function App() {
  const initial = readAppUrl();
  const [tab, setTab] = useState<AppTab>(initial.tab);
  const [day, setDay] = useState(initial.day);
  const [weather, setWeather] = useState<Weather>(initial.weather);
  const [currentSegmentNumber, setCurrentSegmentNumber] = useState(1);
  const [attractionFilters, setAttractionFilters] = useState<AttractionFilters>(
    DEFAULT_ATTRACTION_FILTERS,
  );

  const currentPlan = useMemo(
    () => getPlan(day, weather),
    [day, weather],
  );
  const currentSegment = currentPlan?.segments.find(
    (segment) => segment.segmentNumber === currentSegmentNumber,
  );

  useEffect(() => {
    writeAppUrl({ tab, day, weather });
  }, [tab, day, weather]);

  useEffect(() => {
    function onPopState() {
      const next = readAppUrl();
      setTab(next.tab);
      setDay(next.day);
      setWeather(next.weather);
      setCurrentSegmentNumber(1);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleDayChange(nextDay: number) {
    setDay(nextDay);
    setCurrentSegmentNumber(1);
  }

  function handleWeatherChange(nextWeather: Weather) {
    setWeather(nextWeather);
    setCurrentSegmentNumber(1);
  }

  return (
    <div className={tab === "itinerary" ? "app is-itinerary" : "app"}>
      <main className="app-body">
        {tab === "itinerary" ? (
          <ItineraryView
            day={day}
            weather={weather}
            currentSegmentNumber={currentSegmentNumber}
            onDayChange={handleDayChange}
            onWeatherChange={handleWeatherChange}
            onSelectSegment={setCurrentSegmentNumber}
          />
        ) : (
          <AttractionsView
            filters={attractionFilters}
            onChange={setAttractionFilters}
          />
        )}
      </main>
      {tab === "itinerary" && currentSegment && currentPlan ? (
        <CurrentSegmentBar
          segment={currentSegment}
          index={currentSegment.segmentNumber}
          total={currentPlan.segments.length}
        />
      ) : null}
      <AppTabs activeTab={tab} onChange={setTab} />
    </div>
  );
}
