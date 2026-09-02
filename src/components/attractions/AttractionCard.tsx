import type { Attraction } from "../../types/attractions";
import AttractionBadges from "./AttractionBadges";

interface AttractionCardProps {
  attraction: Attraction;
}

export default function AttractionCard({ attraction }: AttractionCardProps) {
  const price =
    typeof attraction.regularAdultPriceSek === "number" &&
    attraction.regularAdultPriceSek > 0
      ? `${attraction.regularAdultPriceSek} SEK`
      : null;
  const notes = attraction.notes.trim();

  return (
    <article className="attraction-card">
      <h2 className="attraction-name">{attraction.name}</h2>
      <p className="attraction-meta">
        {attraction.area} · {attraction.category}
      </p>
      <AttractionBadges attraction={attraction} />
      <p className="attraction-facts">
        {attraction.typicalTime}
        {price ? ` · ${price}` : ""}
      </p>
      {notes ? (
        <details className="attraction-notes">
          <summary>Notes</summary>
          <p>{notes}</p>
        </details>
      ) : null}
      <div className="attraction-actions">
        <a
          className="maps-button"
          href={attraction.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps
        </a>
        <a
          className="source-button"
          href={attraction.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Website
        </a>
      </div>
    </article>
  );
}
