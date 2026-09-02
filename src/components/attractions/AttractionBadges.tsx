import { getAccessLabel } from "../../data/attractions";
import type { Attraction } from "../../types/attractions";

interface AttractionBadgesProps {
  attraction: Attraction;
}

export default function AttractionBadges({ attraction }: AttractionBadgesProps) {
  const access = getAccessLabel(attraction);
  const indoor = attraction.indoorOutdoor.trim();
  const checkDates = attraction.relevantSep11To15 !== "Yes";

  return (
    <ul className="attraction-badges">
      {access ? <li data-kind={access}>{access}</li> : null}
      {attraction.tripPriority === "Must-see" ? (
        <li data-kind="Must-see">Must-see</li>
      ) : null}
      {attraction.alreadyInItinerary ? (
        <li data-kind="In itinerary">In itinerary</li>
      ) : null}
      {attraction.goodForRain === "Yes" ? (
        <li data-kind="rain">Good for rain</li>
      ) : null}
      {indoor ? <li data-kind="place">{indoor}</li> : null}
      {checkDates ? <li data-kind="dates">Check dates</li> : null}
    </ul>
  );
}
