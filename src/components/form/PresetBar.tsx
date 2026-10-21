import { DEFAULT_PRESETS } from '../../config.ts';
import { EventPlanInput } from '../../types.ts';

interface PresetBarProps {
  onApply: (preset: EventPlanInput) => void;
}

/** Quick-start template buttons. */
export function PresetBar({ onApply }: PresetBarProps) {
  return (
    <div className="preset-bar" role="group" aria-label="Quick Start Templates">
      <span className="preset-label">Templates:</span>
      <div className="preset-buttons">
        {DEFAULT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => onApply(preset.input as EventPlanInput)}
            aria-label={`Load preset ${preset.label}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}