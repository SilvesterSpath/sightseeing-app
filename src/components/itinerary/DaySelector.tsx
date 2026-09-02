import { formatChipDate } from "../../date";
import type { DayPlan } from "../../types/navigation";

interface DaySelectorProps {
  days: DayPlan[];
  selectedDay: number;
  onChange: (day: number) => void;
}

export default function DaySelector({
  days,
  selectedDay,
  onChange,
}: DaySelectorProps) {
  return (
    <div className="day-selector" role="group" aria-label="Day">
      {days.map((day) => {
        const selected = day.day === selectedDay;
        return (
          <button
            key={day.day}
            type="button"
            className={selected ? "day-chip is-selected" : "day-chip"}
            aria-pressed={selected}
            onClick={() => onChange(day.day)}
          >
            <span className="day-chip-label">Day {day.day}</span>
            <span className="day-chip-date">{formatChipDate(day.date)}</span>
          </button>
        );
      })}
    </div>
  );
}
