import type { AppTab } from "../urlState";
import AppTabs from "./AppTabs";

interface AppChromeProps {
  open: boolean;
  tab: AppTab;
  onToggle: () => void;
  onTabChange: (tab: AppTab) => void;
}

export default function AppChrome({
  open,
  tab,
  onToggle,
  onTabChange,
}: AppChromeProps) {
  const label = open ? "Hide tabs" : "Show tabs";

  return (
    <>
      {open ? (
        <button
          type="button"
          className="chrome-scrim"
          aria-label={label}
          onClick={onToggle}
        />
      ) : null}

      <div className={open ? "chrome-bottom is-open" : "chrome-bottom"}>
        <div id="chrome-bottom-panel" className="chrome-collapsible">
          <div className="chrome-collapsible-inner">
            <AppTabs activeTab={tab} onChange={onTabChange} />
          </div>
        </div>
        <button
          type="button"
          className="chrome-handle"
          aria-expanded={open}
          aria-controls="chrome-bottom-panel"
          onClick={onToggle}
        >
          <span className="chrome-handle-bar" />
          <span className="visually-hidden">{label}</span>
        </button>
      </div>
    </>
  );
}
