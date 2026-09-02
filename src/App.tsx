import {
  attractionsData,
  getAreas,
  getAttractions,
  getCategories,
} from "./data/attractions";
import {
  countSegments,
  countWeatherPlans,
  navigationData,
} from "./data/navigation";

const EXPECTED = {
  days: 5,
  weatherPlans: 15,
  segments: 47,
  attractions: 137,
} as const;

function CheckRow({
  label,
  actual,
  expected,
}: {
  label: string;
  actual: number;
  expected: number;
}) {
  const ok = actual === expected;
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{actual}</td>
      <td>{expected}</td>
      <td className={ok ? "ok" : "fail"}>{ok ? "pass" : "fail"}</td>
    </tr>
  );
}

export default function App() {
  const { meta, days, stops } = navigationData;
  const attractions = getAttractions();
  const weatherPlanCount = countWeatherPlans();
  const segmentCount = countSegments();
  const areas = getAreas();
  const categories = getCategories();

  return (
    <main className="sanity">
      <p className="phase-note">Phase 1 sanity check — not the trip UI</p>
      <h1>{meta.title}</h1>
      <p>
        {meta.tripStart} – {meta.tripEnd}
      </p>
      <p>{meta.baseAddress}</p>
      <p>
        schema {meta.schemaVersion} · {meta.sourceWorkbook}
      </p>
      <p>
        {stops.length} master stops · {days.length} days
      </p>

      <h2>Load checks</h2>
      <table>
        <thead>
          <tr>
            <th>Check</th>
            <th>Loaded</th>
            <th>Expected</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <CheckRow label="Days" actual={days.length} expected={EXPECTED.days} />
          <CheckRow
            label="Weather plans"
            actual={weatherPlanCount}
            expected={EXPECTED.weatherPlans}
          />
          <CheckRow
            label="Itinerary segments"
            actual={segmentCount}
            expected={EXPECTED.segments}
          />
          <CheckRow
            label="Attractions"
            actual={attractions.length}
            expected={EXPECTED.attractions}
          />
        </tbody>
      </table>

      <h2>Days from navigation JSON</h2>
      <ul>
        {days.map((day) => (
          <li key={day.day}>
            Day {day.day} · {day.date} · {day.weatherPlans.length} weather
            plans · Go City {day.goCity}
          </li>
        ))}
      </ul>

      <h2>{attractionsData.meta.title}</h2>
      <p>
        {attractionsData.meta.tripDates.start} –{" "}
        {attractionsData.meta.tripDates.end}
      </p>
      <p>
        schema {attractionsData.meta.schemaVersion} ·{" "}
        {attractionsData.meta.sourceWorkbook}
      </p>
      <p>
        Array length {attractions.length} · meta.recordCount{" "}
        {attractionsData.meta.recordCount} · {areas.length} areas ·{" "}
        {categories.length} categories
      </p>
    </main>
  );
}
