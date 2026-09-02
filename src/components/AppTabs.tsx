import type { AppTab } from "../urlState";

const TABS: { id: AppTab; label: string }[] = [
  { id: "itinerary", label: "Itinerary" },
  { id: "attractions", label: "Attractions" },
  { id: "events", label: "Events" },
];

interface AppTabsProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

export default function AppTabs({ activeTab, onChange }: AppTabsProps) {
  return (
    <nav className="app-tabs" aria-label="Primary">
      {TABS.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            className={selected ? "app-tab is-selected" : "app-tab"}
            aria-current={selected ? "page" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
