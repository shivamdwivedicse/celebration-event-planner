/**
 * Default plan shown on first load so the dashboard is populated immediately.
 */
import { EventPlanInput } from './types.ts';

const DEFAULT_LEAD_DAYS = 75;

/** Returns an ISO date (YYYY-MM-DD) a fixed number of days from today. */
export function getDefaultFutureDate(daysAhead = DEFAULT_LEAD_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

/** Builds the initial event plan (date is computed at call time). */
export function createInitialPlan(): EventPlanInput {
  return {
    eventType: 'wedding',
    eventName: 'Ananya & Rohan Royal Wedding Celebration',
    eventDate: getDefaultFutureDate(),
    guestCount: 200,
    budget: 1800000,
    venueType: 'indoor',
    currency: 'INR',
    selectedFunctions: ['Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception'],
    priorities: ['food', 'photography', 'decor'],
    notes:
      'Grand multi-day celebration featuring heritage marigold decor, live dhol, and traditional royal multi-cuisine feast.',
  };
}