import { Flower2 } from 'lucide-react';
import { INDIAN_WEDDING_FUNCTIONS } from '../../config.ts';
import { IndianWeddingFunction } from '../../types.ts';

interface IndianFunctionChipsProps {
  selected: IndianWeddingFunction[] | undefined;
  onToggle: (fn: IndianWeddingFunction) => void;
}

/** Optional multi-day Indian wedding ceremony selector (shown for weddings). */
export function IndianFunctionChips({ selected, onToggle }: IndianFunctionChipsProps) {
  return (
    <div className="form-group mt-3 indian-functions-group">
      <label className="form-label" id="indian-functions-label">
        <Flower2 size={15} aria-hidden="true" className="label-icon text-amber" />
        Indian Wedding Ceremonies & Multi-Day Functions (Optional)
      </label>
      <div className="indian-functions-grid" role="group" aria-labelledby="indian-functions-label">
        {INDIAN_WEDDING_FUNCTIONS.map((fn) => {
          const isSelected = Boolean(selected?.includes(fn.id));
          return (
            <button
              type="button"
              key={fn.id}
              onClick={() => onToggle(fn.id)}
              className={`function-chip ${isSelected ? 'function-chip-active' : ''}`}
              aria-pressed={isSelected}
            >
              <div className="function-chip-top">
                <span className="function-name">{fn.name}</span>
                {isSelected && (
                  <span className="function-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>
              <span className="function-tagline">{fn.tagline}</span>
              <span className="function-time text-xs">{fn.recommendedTimeframe}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
