import AppMenu from "./AppMenu";
import ThemeToggle from "./ThemeToggle";

interface PaneToolsProps {
  canReset: boolean;
  onResetPlan: () => void;
}

export default function PaneTools({ canReset, onResetPlan }: PaneToolsProps) {
  return (
    <div className="pane-tools">
      <ThemeToggle />
      <AppMenu canReset={canReset} onResetPlan={onResetPlan} />
    </div>
  );
}
