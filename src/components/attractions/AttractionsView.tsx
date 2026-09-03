import { useMemo, useState } from "react";
import {
  countPanelFilters,
  DEFAULT_ATTRACTION_FILTERS,
  filterAndSortAttractions,
  type AccessFilter,
  type AttractionFilters,
} from "../../attractionFilters";
import { attractionsData, getAttractions } from "../../data/attractions";
import PaneTools from "../PaneTools";
import AttractionCard from "./AttractionCard";
import AttractionsFilters from "./AttractionsFilters";
import AttractionsSearch from "./AttractionsSearch";
import EmptyAttractionsState from "./EmptyAttractionsState";

const ACCESS_CHIPS: AccessFilter[] = ["All", "Free", "Go City", "Paid"];

interface AttractionsViewProps {
  filters: AttractionFilters;
  onChange: (next: AttractionFilters) => void;
}

export default function AttractionsView({
  filters,
  onChange,
}: AttractionsViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const attractions = getAttractions();
  const total = attractionsData.meta.recordCount;
  const visible = useMemo(
    () => filterAndSortAttractions(attractions, filters),
    [attractions, filters],
  );
  const panelCount = countPanelFilters(filters);

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
          <PaneTools />
        </div>
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
