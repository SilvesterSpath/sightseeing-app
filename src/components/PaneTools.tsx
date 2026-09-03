import AppMenu from "./AppMenu";
import ThemeToggle from "./ThemeToggle";

export default function PaneTools() {
  return (
    <div className="pane-tools">
      <ThemeToggle />
      <AppMenu />
    </div>
  );
}
