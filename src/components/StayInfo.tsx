import { navigationData } from "../data/navigation";

export default function StayInfo() {
  const stay = navigationData.meta.stay;

  return (
    <div className="stay-info">
      <p className="stay-kicker">{stay.accessLabel}</p>
      <p>{stay.entrance}</p>
      <p>{stay.location}</p>
      <p>Check-in: {stay.checkIn}</p>
      <p>Check-out: {stay.checkOut}</p>
      <p>Nearest metro: {stay.nearestMetro}</p>
    </div>
  );
}
