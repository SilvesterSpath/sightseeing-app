import {
  getEventAreas,
  getEventCategories,
  getEvents,
} from "../../data/events";
import {
  EVENT_STATUS_FILTERS,
  getIndoorOptions,
  type EventFilters,
} from "../../eventFilters";

interface EventsFiltersProps {
  filters: EventFilters;
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  onChange: (next: EventFilters) => void;
  onReset: () => void;
}

export default function EventsFilters({
  filters,
  open,
  activeCount,
  onToggle,
  onChange,
  onReset,
}: EventsFiltersProps) {
  const events = getEvents();
  const areas = getEventAreas();
  const categories = getEventCategories();
  const indoorOptions = getIndoorOptions(events);

  return (
    <div className="events-filters">
      <div className="filters-toolbar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={open}
          onClick={onToggle}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>
      {open ? (
        <div className="filters-panel">
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
          <fieldset className="filter-fieldset">
            <legend>Indoor / outdoor</legend>
            <div className="filter-chips">
              {indoorOptions.map((option) => {
                const selected = filters.indoor === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={
                      selected ? "filter-chip is-selected" : "filter-chip"
                    }
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({ ...filters, indoor: option })
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="filter-fieldset">
            <legend>Status</legend>
            <div className="filter-chips">
              {EVENT_STATUS_FILTERS.map((option) => {
                const selected = filters.status === option;
                return (
                  <button
                    key={option}
                    type="button"
                    className={
                      selected ? "filter-chip is-selected" : "filter-chip"
                    }
                    aria-pressed={selected}
                    onClick={() =>
                      onChange({ ...filters, status: option })
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <button type="button" className="reset-filters" onClick={onReset}>
            Reset filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
