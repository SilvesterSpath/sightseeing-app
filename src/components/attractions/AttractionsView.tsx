import { attractionsData, getAttractions } from "../../data/attractions";
import AttractionCard from "./AttractionCard";

export default function AttractionsView() {
  const attractions = getAttractions();
  const total = attractionsData.meta.recordCount;

  return (
    <section className="pane attractions-pane" aria-labelledby="attractions-heading">
      <header className="attractions-header">
        <h1 id="attractions-heading">Attractions</h1>
        <p className="muted">
          {attractions.length} of {total}
        </p>
      </header>
      <div className="attraction-list">
        {attractions.map((attraction) => (
          <AttractionCard key={attraction.name} attraction={attraction} />
        ))}
      </div>
    </section>
  );
}
