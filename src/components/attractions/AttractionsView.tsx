import { attractionsData, getAttractions } from "../../data/attractions";

export default function AttractionsView() {
  const count = getAttractions().length;

  return (
    <section className="pane" aria-labelledby="attractions-heading">
      <h1 id="attractions-heading">Attractions</h1>
      <p>{attractionsData.meta.title}</p>
      <p>
        {count} attractions in the catalogue.
      </p>
      <p className="muted">Search and filters come next.</p>
    </section>
  );
}
