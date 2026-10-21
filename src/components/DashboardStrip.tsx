import { Calendar, Sparkles } from 'lucide-react';

const RING_RADIUS = 18;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface DashboardStripProps {
  eventName: string;
  daysUntilEvent: number;
  completed: number;
  total: number;
  percent: number;
}

/** Builds the countdown sentence shown next to the calendar icon. */
function countdownText(days: number, eventName: string): string {
  if (days <= 0) return '🎉 Celebration is Today!';
  return `🎉 ${days} Day${days === 1 ? '' : 's'} to ${eventName}`;
}

/** Overview strip: event countdown, checklist progress ring, and 100% celebration. */
export function DashboardStrip({
  eventName,
  daysUntilEvent,
  completed,
  total,
  percent,
}: DashboardStripProps) {
  const ringOffset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;

  return (
    <div
      className="dashboard-strip"
      role="region"
      aria-label="Event Countdown and Readiness Overview"
    >
      <div className="dashboard-left">
        <div
          className="countdown-box"
          role="status"
          aria-label={`Event countdown: ${daysUntilEvent} days until celebration`}
        >
          <Calendar size={18} aria-hidden="true" />
          <span>{countdownText(daysUntilEvent, eventName)}</span>
        </div>

        <div className="progress-ring-box" role="region" aria-label="Checklist completion ring">
          <svg className="progress-ring-svg" viewBox="0 0 44 44" aria-hidden="true">
            <circle
              className="progress-ring-bg"
              cx="22"
              cy="22"
              r={RING_RADIUS}
              strokeWidth="4"
              fill="none"
            />
            <circle
              className="progress-ring-meter"
              cx="22"
              cy="22"
              r={RING_RADIUS}
              strokeWidth="4"
              stroke="#059669"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="progress-ring-text">
            <span className="progress-pct">{percent}% Prepared</span>
            <span className="progress-label">
              {completed} of {total} milestones checked
            </span>
          </div>
        </div>
      </div>

      {percent === 100 && (
        <div className="confetti-celebration" role="status">
          <Sparkles size={18} aria-hidden="true" />
          <span>100% Milestone Readiness Achieved! All checklists verified!</span>
        </div>
      )}
    </div>
  );
}