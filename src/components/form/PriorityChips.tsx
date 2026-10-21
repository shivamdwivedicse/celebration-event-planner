import { Tag } from 'lucide-react';
import { Priority } from '../../types.ts';

const PRIORITY_OPTIONS: { id: Priority; label: string }[] = [
  { id: 'food', label: '🍽️ Food & Catering' },
  { id: 'venue', label: '🏛️ Venue & Atmosphere' },
  { id: 'photography', label: '📸 Photography & Video' },
  { id: 'entertainment', label: '🎵 Music & Entertainment' },
  { id: 'decor', label: '💐 Decor & Styling' },
  { id: 'invitations', label: '💌 Invitations & Stationery' },
];

interface PriorityChipsProps {
  selected: Priority[];
  onToggle: (priority: Priority) => void;
}

/** Toggle chips for the priorities that receive extra budget share. */
export function PriorityChips({ selected, onToggle }: PriorityChipsProps) {
  return (
    <div className="form-group mt-3">
      <label className="form-label" id="priorities-group-label">
        <Tag size={15} aria-hidden="true" className="label-icon" />
        Top Priorities (Allocates extra budget share)
      </label>
      <div className="chip-group" role="group" aria-labelledby="priorities-group-label">
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <button
              type="button"
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={`chip ${isSelected ? 'chip-active' : ''}`}
              aria-pressed={isSelected}
            >
              {option.label}
              {isSelected && (
                <span className="chip-check" aria-hidden="true">
                  {' '}
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
