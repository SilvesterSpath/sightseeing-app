export const CURRENT_BAR_STORAGE_KEY = "sightseeng.currentBar.v1";

export function readCurrentBarCollapsed(): boolean {
  try {
    return window.localStorage.getItem(CURRENT_BAR_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeCurrentBarCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(
      CURRENT_BAR_STORAGE_KEY,
      collapsed ? "1" : "0",
    );
  } catch {
    // Private mode or blocked storage must not crash the app.
  }
}
