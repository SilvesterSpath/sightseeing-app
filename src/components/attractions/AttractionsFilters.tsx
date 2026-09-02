import { getAreas, getCategories } from "../../data/attractions";
import type {
  AttractionFilters,
  AttractionSort,
  PriorityFilter,
  RainFilter,
  TripStatusFilter,
} from "../../attractionFilters";

interface AttractionsFiltersProps {
  filters: AttractionFilters;
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  onChange: (next: AttractionFilters) => void;
  onReset: () => void;
}

const TRIP_STATUS: TripStatusFilter[] = [
  "All",
  "In itinerary",
  "Not in itinerary",
];
const RAIN: RainFilter[] = ["All", "Good for rain", "Outdoor"];
const PRIORITIES: PriorityFilter[] = [
  "All",
  "Must-see",
  "High",
  "Medium",
  "Low",
];
const SORTS: { id: AttractionSort; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "name", label: "Name" },
  { id: "area", label: "Area" },
];

function ChipGroup<T extends string>({
  label,
  options,
  value,
  optionLabel,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  optionLabel?: (option: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="filter-fieldset">
      <legend>{label}</legend>
      <div className="filter-chips">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              className={selected ? "filter-chip is-selected" : "filter-chip"}
              aria-pressed={selected}
              onClick={() => onChange(option)}
            >
              {optionLabel ? optionLabel(option) : option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function AttractionsFilters({
  filters,
  open,
  activeCount,
  onToggle,
  onChange,
  onReset,
}: AttractionsFiltersProps) {
  const areas = getAreas();
  const categories = getCategories();

  return (
    <div className="attractions-filters">
      <div className="filters-toolbar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={open}
          onClick={onToggle}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <label className="sort-label">
          <span className="visually-hidden">Sort</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onChange({
                ...filters,
                sort: event.target.value as AttractionSort,
              })
            }
          >
            {SORTS.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {open ? (
        <div className="filters-panel">
          <ChipGroup
            label="Trip status"
            options={TRIP_STATUS}
            value={filters.tripStatus}
            onChange={(tripStatus) => onChange({ ...filters, tripStatus })}
          />
          <ChipGroup
            label="Weather"
            options={RAIN}
            value={filters.rain}
            optionLabel={(option) =>
              option === "Outdoor" ? "Outdoor / weather-dependent" : option
            }
            onChange={(rain) => onChange({ ...filters, rain })}
          />
          <ChipGroup
            label="Priority"
            options={PRIORITIES}
            value={filters.priority}
            onChange={(priority) => onChange({ ...filters, priority })}
          />
          <label className="filter-select">
            Area
            <select
              value={filters.area}
              onChange={(event) =>
                onChange({ ...filters, area: event.target.value })
              }
            >
              <option value="">All areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-select">
            Category
            <select
              value={filters.category}
              onChange={(event) =>
                onChange({ ...filters, category: event.target.value })
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="reset-filters" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
