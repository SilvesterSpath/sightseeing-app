import { navigationData } from "../data/navigation";
import type { Weather } from "../types/navigation";
import type { AppTab } from "../urlState";
import AppTabs from "./AppTabs";
import DaySelector from "./itinerary/DaySelector";
import WeatherSelector from "./itinerary/WeatherSelector";

interface AppChromeProps {
  open: boolean;
  day: number;
  weather: Weather;
  tab: AppTab;
  onToggle: () => void;
  onDayChange: (day: number) => void;
  onWeatherChange: (weather: Weather) => void;
  onTabChange: (tab: AppTab) => void;
}

export default function AppChrome({
  open,
  day,
  weather,
  tab,
  onToggle,
  onDayChange,
  onWeatherChange,
  onTabChange,
}: AppChromeProps) {
  const label = open
    ? "Hide day, weather and tabs"
    : "Show day, weather and tabs";

  return (
    <>
      {open ? (
        <button
          type="button"
          className="chrome-scrim"
          aria-label={label}
          onClick={onToggle}
        />
      ) : null}

      <div className={open ? "chrome-top is-open" : "chrome-top"}>
        <button
          type="button"
          className="chrome-handle"
          aria-expanded={open}
          aria-controls="chrome-top-panel"
          onClick={onToggle}
        >
          <span className="chrome-handle-bar" />
          <span className="visually-hidden">{label}</span>
        </button>
        <div id="chrome-top-panel" className="chrome-collapsible">
          <div className="chrome-collapsible-inner">
            <div className="chrome-top-body">
              {tab !== "attractions" ? (
                <DaySelector
                  days={navigationData.days}
                  selectedDay={day}
                  onChange={onDayChange}
                />
              ) : null}
              <WeatherSelector
                selectedWeather={weather}
                onChange={onWeatherChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={open ? "chrome-bottom is-open" : "chrome-bottom"}>
        <div id="chrome-bottom-panel" className="chrome-collapsible">
          <div className="chrome-collapsible-inner">
            <AppTabs activeTab={tab} onChange={onTabChange} />
          </div>
        </div>
        <button
          type="button"
          className="chrome-handle"
          aria-expanded={open}
          aria-controls="chrome-bottom-panel"
          onClick={onToggle}
        >
          <span className="chrome-handle-bar" />
          <span className="visually-hidden">{label}</span>
        </button>
      </div>
    </>
  );
}
