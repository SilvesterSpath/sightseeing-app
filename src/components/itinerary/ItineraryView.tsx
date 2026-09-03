import { getPlan, navigationData } from "../../data/navigation";
import type { Weather } from "../../types/navigation";
import PaneTools from "../PaneTools";
import DaySelector from "./DaySelector";
import SegmentList from "./SegmentList";
import WeatherSelector from "./WeatherSelector";

interface ItineraryViewProps {
  day: number;
  weather: Weather;
  currentSegmentNumber: number;
  completed: ReadonlySet<string>;
  canReset: boolean;
  onDayChange: (day: number) => void;
  onWeatherChange: (weather: Weather) => void;
  onToggleComplete: (segmentNumber: number) => void;
  onResetPlan: () => void;
}

function goCityLabel(goCity: string): string | null {
  if (!goCity.startsWith("day-")) {
    return null;
  }
  return `Go City day ${goCity.slice("day-".length)}`;
}

export default function ItineraryView({
  day,
  weather,
  currentSegmentNumber,
  completed,
  canReset,
  onDayChange,
  onWeatherChange,
  onToggleComplete,
  onResetPlan,
}: ItineraryViewProps) {
  const { meta, days } = navigationData;
  const selectedDay = days.find((entry) => entry.day === day) ?? days[0];

  if (!selectedDay) {
    return <p>No itinerary days loaded.</p>;
  }

  const plan = getPlan(selectedDay.day, weather);
  const cityPass = goCityLabel(selectedDay.goCity);
  const segments = plan?.segments ?? [];

  return (
    <section className="pane itinerary-pane" aria-labelledby="itinerary-heading">
      <header className="itinerary-controls">
        <div className="pane-heading-row">
          <div>
            <h1 id="itinerary-heading">Stockholm Trip</h1>
            <p className="trip-range">
              {meta.tripStart} – {meta.tripEnd}
            </p>
          </div>
          <PaneTools canReset={canReset} onResetPlan={onResetPlan} />
        </div>
        <DaySelector
          days={days}
          selectedDay={selectedDay.day}
          onChange={onDayChange}
        />
        <WeatherSelector
          selectedWeather={weather}
          onChange={onWeatherChange}
        />
        {cityPass ? <p className="go-city-badge">{cityPass}</p> : null}
      </header>

      <SegmentList
        segments={segments}
        currentSegmentNumber={currentSegmentNumber}
        completed={completed}
        day={selectedDay.day}
        weather={weather}
        onToggleComplete={onToggleComplete}
      />
    </section>
  );
}
