export default function AppMenu() {
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
      </div>
    </details>
  );
}
