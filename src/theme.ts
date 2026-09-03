export const THEME_STORAGE_KEY = "sightseeng.theme.v1";
export const THEME_LIGHT = "#f4f1ea";
export const THEME_DARK = "#161512";

export type Theme = "light" | "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  return isTheme(stored) ? stored : prefersDark ? "dark" : "light";
}

export function prefersDarkScheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readResolvedTheme(): Theme {
  return resolveTheme(readStoredTheme(), prefersDarkScheme());
}

export function writeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage must not crash the app.
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute(
      "content",
      theme === "dark" ? THEME_DARK : THEME_LIGHT,
    );
  }
}
