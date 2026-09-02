import { WEATHERS } from "../../data/navigation";
import type { Weather } from "../../types/navigation";

interface WeatherSelectorProps {
  selectedWeather: Weather;
  onChange: (weather: Weather) => void;
}

export default function WeatherSelector({
  selectedWeather,
  onChange,
}: WeatherSelectorProps) {
  return (
    <div className="weather-selector" role="group" aria-label="Weather">
      {WEATHERS.map((weather) => {
        const selected = weather === selectedWeather;
        return (
          <button
            key={weather}
            type="button"
            className={
              selected ? "weather-chip is-selected" : "weather-chip"
            }
            data-weather={weather}
            aria-pressed={selected}
            onClick={() => onChange(weather)}
          >
            {weather}
          </button>
        );
      })}
    </div>
  );
}
