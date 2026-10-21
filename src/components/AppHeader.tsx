import {
  Contrast,
  Download,
  Moon,
  PartyPopper,
  Printer,
  Sun,
  Type as TypeIcon,
} from 'lucide-react';
import type { FontSizeMode, ThemeMode } from '../hooks/useDisplayPreferences.ts';

interface AppHeaderProps {
  theme: ThemeMode;
  fontSize: FontSizeMode;
  highContrast: boolean;
  onToggleTheme: () => void;
  onCycleFontSize: () => void;
  onToggleContrast: () => void;
  onExportCalendar: () => void;
  onPrint: () => void;
}

/** Page header: brand, display/accessibility toolbar, and export actions. */
export function AppHeader({
  theme,
  fontSize,
  highContrast,
  onToggleTheme,
  onCycleFontSize,
  onToggleContrast,
  onExportCalendar,
  onPrint,
}: AppHeaderProps) {
  const themeLabel = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';

  return (
    <header className="app-header" role="banner">
      <div className="header-container">
        <div className="brand-wrapper">
          <div className="brand-icon-box" aria-hidden="true">
            <PartyPopper size={24} />
          </div>
          <div>
            <h1 className="app-title">Celebration & Event Planner</h1>
            <p className="app-tagline">
              Deterministic Budgeting & Timeline Assistant with Gemini Contextual Intelligence
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div
            className="accessibility-controls"
            role="toolbar"
            aria-label="Display & Accessibility Controls"
          >
            <button
              type="button"
              onClick={onToggleTheme}
              className="btn-icon"
              title={themeLabel}
              aria-label={themeLabel}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={onToggleContrast}
              className={`btn-icon ${highContrast ? 'text-primary' : ''}`}
              title="Toggle High Contrast Mode"
              aria-label="Toggle High Contrast Mode"
              aria-pressed={highContrast}
            >
              <Contrast size={17} />
            </button>

            <button
              type="button"
              onClick={onCycleFontSize}
              className="btn-icon"
              title={`Text Size: ${fontSize.toUpperCase()} (Click to change)`}
              aria-label={`Change text size. Currently ${fontSize}`}
            >
              <TypeIcon size={17} />
            </button>
          </div>

          <button
            type="button"
            onClick={onExportCalendar}
            className="btn btn-secondary btn-sm"
            title="Download iCalendar (.ics) file with milestones & hourly schedule"
            aria-label="Export milestones to iCalendar file"
          >
            <Download size={15} aria-hidden="true" />
            <span>Export .ICS</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="btn btn-secondary btn-sm"
            aria-label="Print or save current event plan as PDF"
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
