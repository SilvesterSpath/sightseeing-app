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

function dateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatChipDate(isoDate: string): string {
  return dateFromIso(isoDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatEventDateChip(isoDate: string): string {
  const date = dateFromIso(isoDate);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${date.getDate()}`;
}

export function formatEventDayHeading(isoDate: string): string {
  const date = dateFromIso(isoDate);
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} ${month} ${date.getDate()}`;
}

export function isoDateForTripDay(day: number): string {
  return getDay(day)?.date ?? navigationData.days[0]?.date ?? "";
}

export function tripDayForIsoDate(isoDate: string): number | undefined {
  return navigationData.days.find((day) => day.date === isoDate)?.day;
}

export function isValidDay(day: number): boolean {
  return getDay(day) !== undefined;
}
