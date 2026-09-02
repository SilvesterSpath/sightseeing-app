export default function AppMenu() {
  return (
    <details className="app-menu">
      <summary className="app-menu-summary" aria-label="Offline and Maps info">
        Info
      </summary>
      <div className="app-menu-panel">
        <p>
          After the first visit, itinerary and attractions work without a
          signal.
        </p>
        <p>Google Maps and official websites need a connection.</p>
      </div>
    </details>
  );
}
