import { useEffect, useMemo, useState, type ComponentType } from "react";
import AppTabs from "./components/AppTabs";
import AttractionsView from "./components/attractions/AttractionsView";
import EventsView from "./components/events/EventsView";
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
  hydrateProgress,
  planHasProgress,
  resolveCurrentSegment,
  saveProgress,
  segmentProgressKey,
  uncompleteFromThrough,
} from "./progress";
import type { Weather } from "./types/navigation";
import { readAppUrl, writeAppUrl } from "./urlState";

type DevMapsPanel = ComponentType<{ onClose: () => void }>;

const devMapsLoaders = import.meta.glob<{ default: DevMapsPanel }>(
  "./dev/DevMapsTest.tsx",
);

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
  const [devMapsOpen, setDevMapsOpen] = useState(false);
  const [DevMapsPanel, setDevMapsPanel] = useState<DevMapsPanel | null>(null);

  const currentPlan = useMemo(
    () => getPlan(day, weather),
    [day, weather],
  );
  const currentSegmentNumber = useMemo(
    () => resolveCurrentSegment(currentPlan, completed, day, weather),
    [currentPlan, completed, day, weather],
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

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    function openDevMaps() {
      setDevMapsOpen(true);
    }

    window.addEventListener("sightseeng:dev-maps-test", openDevMaps);
    return () => {
      window.removeEventListener("sightseeng:dev-maps-test", openDevMaps);
    };
  }, []);

  useEffect(() => {
    const loadPanel = import.meta.env.DEV
      ? devMapsLoaders["./dev/DevMapsTest.tsx"]
      : undefined;

    if (!loadPanel || !devMapsOpen || DevMapsPanel) {
      return;
    }

    let cancelled = false;
    void loadPanel().then((module) => {
      if (!cancelled) {
        setDevMapsPanel(() => module.default);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [devMapsOpen, DevMapsPanel]);

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

  function handleResetPlan() {
    setCompleted(clearPlanProgress(completed, day, weather));
  }

  return (
    <div className="app">
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
      <AppTabs activeTab={tab} onChange={setTab} />
      {import.meta.env.DEV && devMapsOpen && DevMapsPanel ? (
        <DevMapsPanel onClose={() => setDevMapsOpen(false)} />
      ) : null}
    </div>
  );
}
