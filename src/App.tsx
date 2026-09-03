import { useEffect, useMemo, useState } from "react";
import AppTabs from "./components/AppTabs";
import AttractionsView from "./components/attractions/AttractionsView";
import EventsView from "./components/events/EventsView";
import CurrentSegmentBar from "./components/itinerary/CurrentSegmentBar";
import ItineraryView from "./components/itinerary/ItineraryView";
import {
  DEFAULT_ATTRACTION_FILTERS,
  type AttractionFilters,
} from "./attractionFilters";
import {
  readCurrentBarCollapsed,
  writeCurrentBarCollapsed,
} from "./currentBar";
import { getPlan } from "./data/navigation";
import { isoDateForTripDay } from "./date";
import {
  defaultEventFilters,
  type EventFilters,
} from "./eventFilters";
import {
  clearPlanProgress,
  hydrateProgress,
  isSegmentComplete,
  planHasProgress,
  resolveCurrentSegment,
  saveProgress,
  segmentProgressKey,
  uncompleteFromThrough,
} from "./progress";
import type { Weather } from "./types/navigation";
import { readAppUrl, writeAppUrl } from "./urlState";

export default function App() {
  const [boot] = useState(hydrateProgress);
  const [tab, setTab] = useState(boot.tab);
  const [day, setDay] = useState(boot.day);
  const [weather, setWeather] = useState<Weather>(boot.weather);
  const [completed, setCompleted] = useState(boot.completed);
  const [attractionFilters, setAttractionFilters] = useState<AttractionFilters>(
    DEFAULT_ATTRACTION_FILTERS,
  );
  const [eventFilters, setEventFilters] = useState<EventFilters>(() =>
    defaultEventFilters(isoDateForTripDay(boot.day)),
  );
  const [eventFiltersOpen, setEventFiltersOpen] = useState(false);
  const [barCollapsed, setBarCollapsed] = useState(readCurrentBarCollapsed);

  const currentPlan = useMemo(
    () => getPlan(day, weather),
    [day, weather],
  );
  const currentSegmentNumber = useMemo(
    () => resolveCurrentSegment(currentPlan, completed, day, weather),
    [currentPlan, completed, day, weather],
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
  const canReset = planHasProgress(completed, day, weather);

  useEffect(() => {
    writeAppUrl({ tab, day, weather });
  }, [tab, day, weather]);

  useEffect(() => {
    saveProgress({
      tab,
      day,
      weather,
      completed: [...completed],
    });
  }, [tab, day, weather, completed]);

  useEffect(() => {
    function onPopState() {
      const next = readAppUrl();
      setTab(next.tab);
      setDay(next.day);
      setWeather(next.weather);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function handleToggleComplete(segmentNumber: number) {
    const key = segmentProgressKey(day, weather, segmentNumber);
    const wasComplete = completed.has(key);

    if (wasComplete) {
      setCompleted(
        uncompleteFromThrough(
          completed,
          currentPlan,
          day,
          weather,
          segmentNumber,
          currentSegmentNumber,
        ),
      );
      return;
    }

    const nextCompleted = new Set(completed);
    nextCompleted.add(key);
    setCompleted(nextCompleted);
  }

  function handleToggleBarCollapsed() {
    setBarCollapsed((collapsed) => {
      const next = !collapsed;
      writeCurrentBarCollapsed(next);
      return next;
    });
  }

  function handleResetPlan() {
    setCompleted(clearPlanProgress(completed, day, weather));
  }

  return (
    <div
      className={
        tab === "itinerary"
          ? barCollapsed
            ? "app is-itinerary is-bar-collapsed"
            : "app is-itinerary"
          : "app"
      }
    >
      <main className="app-body">
        {tab === "itinerary" ? (
          <ItineraryView
            day={day}
            weather={weather}
            currentSegmentNumber={currentSegmentNumber}
            completed={completed}
            canReset={canReset}
            onDayChange={setDay}
            onWeatherChange={setWeather}
            onToggleComplete={handleToggleComplete}
            onResetPlan={handleResetPlan}
          />
        ) : tab === "attractions" ? (
          <AttractionsView
            filters={attractionFilters}
            canReset={canReset}
            onChange={setAttractionFilters}
            onResetPlan={handleResetPlan}
          />
        ) : (
          <EventsView
            itineraryDay={day}
            filters={eventFilters}
            filtersOpen={eventFiltersOpen}
            canReset={canReset}
            onChange={setEventFilters}
            onToggleFilters={() => setEventFiltersOpen((open) => !open)}
            onResetPlan={handleResetPlan}
          />
        )}
      </main>
      {tab === "itinerary" && currentSegment && currentPlan ? (
        <CurrentSegmentBar
          segment={currentSegment}
          index={currentSegment.segmentNumber}
          total={currentPlan.segments.length}
          isComplete={currentComplete}
          collapsed={barCollapsed}
          onToggleCollapsed={handleToggleBarCollapsed}
          onToggleComplete={() =>
            handleToggleComplete(currentSegment.segmentNumber)
          }
        />
      ) : null}
      <AppTabs activeTab={tab} onChange={setTab} />
    </div>
  );
}
