interface AppMenuProps {
  canReset: boolean;
  onResetPlan: () => void;
}

export default function AppMenu({ canReset, onResetPlan }: AppMenuProps) {
  return (
    <details className="app-menu">
      <summary className="app-menu-summary" aria-label="Offline and Maps info">
        Info
      </summary>
      <div className="app-menu-panel">
        <p>
          After the first visit, itinerary, attractions and events work without
          a signal.
        </p>
        <p>
          Event times, prices and ticket status may be stale. Recheck before
          booking.
        </p>
        <p>Google Maps and ticket or source links need a connection.</p>
        <button
          type="button"
          className="reset-plan"
          disabled={!canReset}
          onClick={(event) => {
            onResetPlan();
            event.currentTarget.closest("details")?.removeAttribute("open");
          }}
        >
          Reset this plan
        </button>
        <p>
          Clears done marks for this day and weather.
        </p>
      </div>
    </details>
  );
}
