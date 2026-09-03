import { useState } from "react";
import {
  applyTheme,
  readResolvedTheme,
  writeTheme,
  type Theme,
} from "../theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readResolvedTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeTheme(next);
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
