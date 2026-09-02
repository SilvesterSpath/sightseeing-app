import { getDay, navigationData } from "./data/navigation";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function defaultTripDay(): number {
  const today = todayIsoDate();
  const match = navigationData.days.find((day) => day.date === today);
  return match?.day ?? navigationData.days[0]?.day ?? 1;
}

export function formatChipDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function isValidDay(day: number): boolean {
  return getDay(day) !== undefined;
}
