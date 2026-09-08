import { useMemo, useState } from "react";
import {
  countPanelFilters,
  DEFAULT_ATTRACTION_FILTERS,
  filterAndSortAttractions,
  type AccessFilter,
  type AttractionFilters,
} from "../../attractionFilters";
import { attractionsData, getAttractions } from "../../data/attractions";
import { navigationData } from "../../data/navigation";
import PaneTools from "../PaneTools";
import DaySelector from "../itinerary/DaySelector";
import AttractionCard from "./AttractionCard";
import AttractionsFilters from "./AttractionsFilters";
import AttractionsSearch from "./AttractionsSearch";
import EmptyAttractionsState from "./EmptyAttractionsState";

const ACCESS_CHIPS: AccessFilter[] = ["All", "Free", "Go City", "Paid"];

interface AttractionsViewProps {
  day: number;
  filters: AttractionFilters;
  canReset: boolean;
  onDayChange: (day: number) => void;
  onChange: (next: AttractionFilters) => void;
  onResetPlan: () => void;
}

export default function AttractionsView({
  day,
  filters,
  canReset,
  onDayChange,
  onChange,
  onResetPlan,
}: AttractionsViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const attractions = getAttractions();
  const total = attractionsData.meta.recordCount;
  const visible = useMemo(
    () => filterAndSortAttractions(attractions, filters),
    [attractions, filters],
  );
  const panelCount = countPanelFilters(filters);
  const toolsActive =
    panelCount +
    (filters.search.trim() ? 1 : 0) +
    (filters.access !== "All" ? 1 : 0);

  function resetFilters() {
    onChange(DEFAULT_ATTRACTION_FILTERS);
  }

  return (
    <section className="pane attractions-pane" aria-labelledby="attractions-heading">
      <header className="attractions-header">
        <div className="attractions-heading-row">
          <h1 id="attractions-heading">Attractions</h1>
          <p className="muted result-count">
            {visible.length} of {total}
          </p>
          <PaneTools canReset={canReset} onResetPlan={onResetPlan} />
        </div>
        <DaySelector
          days={navigationData.days}
          selectedDay={day}
          onChange={onDayChange}
        />
        <button
          type="button"
          className="attractions-tools-toggle"
          aria-expanded={toolsOpen}
          aria-controls="attractions-tools-panel"
          onClick={() => setToolsOpen((open) => !open)}
        >
          Search & filters{toolsActive > 0 ? ` (${toolsActive})` : ""}
        </button>
        {toolsOpen ? (
          <div id="attractions-tools-panel" className="attractions-tools-panel">
            <AttractionsSearch
              value={filters.search}
              onChange={(search) => onChange({ ...filters, search })}
            />
            <div className="access-chips" role="group" aria-label="Access">
              {ACCESS_CHIPS.map((access) => {
                const selected = filters.access === access;
                return (
                  <button
                    key={access}
                    type="button"
                    className={selected ? "access-chip is-selected" : "access-chip"}
                    aria-pressed={selected}
                    onClick={() => onChange({ ...filters, access })}
                  >
                    {access}
                  </button>
                );
              })}
            </div>
            <AttractionsFilters
              filters={filters}
              open={filtersOpen}
              activeCount={panelCount}
              onToggle={() => setFiltersOpen((open) => !open)}
              onChange={onChange}
              onReset={resetFilters}
            />
          </div>
        ) : null}
      </header>
      {visible.length === 0 ? (
        <EmptyAttractionsState onReset={resetFilters} />
      ) : (
        <div className="attraction-list">
          {visible.map((attraction) => (
            <AttractionCard key={attraction.name} attraction={attraction} />
          ))}
        </div>
      )}
    </section>
  );
}
