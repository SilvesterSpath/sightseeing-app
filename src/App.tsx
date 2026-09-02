import { useEffect, useMemo, useRef, useState } from "react";
import AppTabs from "./components/AppTabs";
import AttractionsView from "./components/attractions/AttractionsView";
import EventsView from "./components/events/EventsView";
import CurrentSegmentBar from "./components/itinerary/CurrentSegmentBar";
import ItineraryView from "./components/itinerary/ItineraryView";
import {
  DEFAULT_ATTRACTION_FILTERS,
  type AttractionFilters,
} from "./attractionFilters";
import { getPlan } from "./data/navigation";
import { isoDateForTripDay } from "./date";
import {
  defaultEventFilters,
  type EventFilters,
} from "./eventFilters";
import {
  clearPlanProgress,
  firstIncompleteSegment,
  hydrateProgress,
  isSegmentComplete,
  planHasProgress,
  planProgressKey,
  resolveCurrentSegment,
  saveProgress,
  segmentProgressKey,
} from "./progress";
import type { Weather } from "./types/navigation";
import { readAppUrl, writeAppUrl } from "./urlState";

export default function App() {
  const [boot] = useState(hydrateProgress);
  const [tab, setTab] = useState(boot.tab);
  const [day, setDay] = useState(boot.day);
  const [weather, setWeather] = useState<Weather>(boot.weather);
  const [currentSegmentNumber, setCurrentSegmentNumber] = useState(
    boot.currentSegmentNumber,
  );
  const [completed, setCompleted] = useState(boot.completed);
  const [currentByPlan, setCurrentByPlan] = useState(boot.currentByPlan);
  const [attractionFilters, setAttractionFilters] = useState<AttractionFilters>(
    DEFAULT_ATTRACTION_FILTERS,
  );
  const [eventFilters, setEventFilters] = useState<EventFilters>(() =>
    defaultEventFilters(isoDateForTripDay(boot.day)),
  );
  const [eventFiltersOpen, setEventFiltersOpen] = useState(false);

  const progressRef = useRef({ completed, currentByPlan });
  progressRef.current = { completed, currentByPlan };

  const currentPlan = useMemo(
    () => getPlan(day, weather),
    [day, weather],
  );
  const currentSegment = currentPlan?.segments.find(
    (segment) => segment.segmentNumber === currentSegmentNumber,
  );
  const currentComplete = isSegmentComplete(
    completed,
    day,
    weather,
    currentSegmentNumber,
  );
  const canReset = planHasProgress(
    completed,
    currentByPlan,
    day,
    weather,
    currentSegmentNumber,
  );

  useEffect(() => {
    writeAppUrl({ tab, day, weather });
  }, [tab, day, weather]);

  useEffect(() => {
    saveProgress({
      tab,
      day,
      weather,
      completed: [...completed],
      currentByPlan,
    });
  }, [tab, day, weather, completed, currentByPlan]);

  useEffect(() => {
    function onPopState() {
      const next = readAppUrl();
      const { completed: storedCompleted, currentByPlan: storedCurrent } =
        progressRef.current;
      setTab(next.tab);
      setDay(next.day);
      setWeather(next.weather);
      setCurrentSegmentNumber(
        resolveCurrentSegment(
          getPlan(next.day, next.weather),
          storedCompleted,
          next.day,
          next.weather,
          storedCurrent[planProgressKey(next.day, next.weather)],
        ),
      );
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function rememberCurrent(nextDay: number, nextWeather: Weather, segmentNumber: number) {
    setCurrentSegmentNumber(segmentNumber);
    setCurrentByPlan((prev) => ({
      ...prev,
      [planProgressKey(nextDay, nextWeather)]: segmentNumber,
    }));
  }

  function currentForPlan(nextDay: number, nextWeather: Weather): number {
    return resolveCurrentSegment(
      getPlan(nextDay, nextWeather),
      completed,
      nextDay,
      nextWeather,
      currentByPlan[planProgressKey(nextDay, nextWeather)],
    );
  }

  function handleDayChange(nextDay: number) {
    setDay(nextDay);
    setCurrentSegmentNumber(currentForPlan(nextDay, weather));
  }

  function handleWeatherChange(nextWeather: Weather) {
    setWeather(nextWeather);
    setCurrentSegmentNumber(currentForPlan(day, nextWeather));
  }

  function handleSelectSegment(segmentNumber: number) {
    rememberCurrent(day, weather, segmentNumber);
  }

  function handleToggleComplete(segmentNumber: number) {
    const key = segmentProgressKey(day, weather, segmentNumber);
    const nextCompleted = new Set(completed);
    const wasComplete = nextCompleted.has(key);
    if (wasComplete) {
      nextCompleted.delete(key);
    } else {
      nextCompleted.add(key);
    }
    setCompleted(nextCompleted);

    if (!wasComplete && segmentNumber === currentSegmentNumber) {
      rememberCurrent(
        day,
        weather,
        firstIncompleteSegment(currentPlan, nextCompleted, day, weather) ??
          segmentNumber,
      );
    }
  }

  function handleResetPlan() {
    const next = clearPlanProgress(completed, currentByPlan, day, weather);
    setCompleted(next.completed);
    setCurrentByPlan(next.currentByPlan);
    setCurrentSegmentNumber(
      currentPlan?.segments[0]?.segmentNumber ?? 1,
    );
  }

  return (
    <div className={tab === "itinerary" ? "app is-itinerary" : "app"}>
      <main className="app-body">
        {tab === "itinerary" ? (
          <ItineraryView
            day={day}
            weather={weather}
            currentSegmentNumber={currentSegmentNumber}
            completed={completed}
            canReset={canReset}
            onDayChange={handleDayChange}
            onWeatherChange={handleWeatherChange}
            onSelectSegment={handleSelectSegment}
            onToggleComplete={handleToggleComplete}
            onResetPlan={handleResetPlan}
          />
        ) : tab === "attractions" ? (
          <AttractionsView
            filters={attractionFilters}
            onChange={setAttractionFilters}
          />
        ) : (
          <EventsView
            itineraryDay={day}
            filters={eventFilters}
            filtersOpen={eventFiltersOpen}
            onChange={setEventFilters}
            onToggleFilters={() => setEventFiltersOpen((open) => !open)}
          />
        )}
      </main>
      {tab === "itinerary" && currentSegment && currentPlan ? (
        <CurrentSegmentBar
          segment={currentSegment}
          index={currentSegment.segmentNumber}
          total={currentPlan.segments.length}
          isComplete={currentComplete}
          onToggleComplete={() =>
            handleToggleComplete(currentSegment.segmentNumber)
          }
        />
      ) : null}
      <AppTabs activeTab={tab} onChange={setTab} />
    </div>
  );
}
