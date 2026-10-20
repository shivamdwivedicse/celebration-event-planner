/**
 * Input sanitization and strict validation for event planning forms.
 * Defends against XSS, negative/overflow amounts, invalid dates, and enum tampering.
 */

import { SYSTEM_LIMITS } from '../config.ts';
import { EventPlanInput, EventType, Priority, ValidationResult, VenueType } from '../types.ts';

const VALID_EVENT_TYPES: EventType[] = ['wedding', 'birthday', 'community'];
const VALID_VENUE_TYPES: VenueType[] = ['indoor', 'outdoor', 'home'];
const VALID_PRIORITIES: Priority[] = [
  'food',
  'venue',
  'photography',
  'entertainment',
  'decor',
  'invitations',
];

/**
 * Strips script tags, HTML tags, and dangerous control characters to prevent stored or reflected XSS.
 */
export function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[^\w\s\.,!\?'"\-&()#$@]/gi, '') // Keep alphanumeric and benign punctuation
    .trim()
    .slice(0, maxLength);
}

/**
 * Checks whether an ISO date string is syntactically valid and strictly in the future.
 * Explicitly verifies real calendar dates (e.g. catches Feb 31 or invalid leap years).
 */
export function validateFutureDate(dateStr: string, referenceDate: Date = new Date()): { isValid: boolean; error?: string } {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, error: 'Event date is required.' };
  }

  // Regex format: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return { isValid: false, error: 'Date must be formatted as YYYY-MM-DD.' };
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // Month check 1-12
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month in date.' };
  }

  // Calendar days in month check (including leap year)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > daysInMonth) {
    return { isValid: false, error: `Invalid day for month ${month}: only ${daysInMonth} days exist.` };
  }

  // Compare strictly as midnight UTC
  const inputMidnightUTC = Date.UTC(year, month - 1, day);
  const refMidnightUTC = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  );

  if (inputMidnightUTC <= refMidnightUTC) {
    return { isValid: false, error: 'Event date must be in the future (tomorrow or later).' };
  }

  return { isValid: true };
}

/**
 * Validates the complete EventPlanInput payload.
 */
export function validateEventPlanInput(
  rawInput: Partial<EventPlanInput> | null | undefined,
  referenceDate?: Date
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!rawInput || typeof rawInput !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Event configuration is missing or invalid.' },
    };
  }

  // Event Type
  const eventType = rawInput.eventType as EventType;
  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
    errors.eventType = 'Please select a valid event category (wedding, birthday, or community).';
  }

  // Event Name
  const eventName = sanitizeString(rawInput.eventName, SYSTEM_LIMITS.MAX_NAME_LENGTH);
  if (!eventName) {
    errors.eventName = 'Event name is required.';
  } else if (eventName.length < 3) {
    errors.eventName = 'Event name must be at least 3 characters long.';
  }

  // Event Date
  const dateResult = validateFutureDate(rawInput.eventDate ?? '', referenceDate);
  if (!dateResult.isValid) {
    errors.eventDate = dateResult.error ?? 'Invalid date.';
  }

  // Guest Count
  const rawGuests = Number(rawInput.guestCount);
  if (isNaN(rawGuests) || !Number.isInteger(rawGuests)) {
    errors.guestCount = 'Guest count must be a whole number.';
  } else if (rawGuests < SYSTEM_LIMITS.MIN_GUESTS) {
    errors.guestCount = `Guest count must be at least ${SYSTEM_LIMITS.MIN_GUESTS}.`;
  } else if (rawGuests > SYSTEM_LIMITS.MAX_GUESTS) {
    errors.guestCount = `Guest count cannot exceed ${SYSTEM_LIMITS.MAX_GUESTS.toLocaleString()} guests.`;
  }

  // Budget
  const rawBudget = Number(rawInput.budget);
  if (isNaN(rawBudget)) {
    errors.budget = 'Budget must be a valid number.';
  } else if (rawBudget < SYSTEM_LIMITS.MIN_BUDGET) {
    errors.budget = `Budget must be at least $${SYSTEM_LIMITS.MIN_BUDGET}.`;
  } else if (rawBudget > SYSTEM_LIMITS.MAX_BUDGET) {
    errors.budget = `Budget cannot exceed $${SYSTEM_LIMITS.MAX_BUDGET.toLocaleString()}.`;
  }

  // Venue Type
  const venueType = rawInput.venueType as VenueType;
  if (!venueType || !VALID_VENUE_TYPES.includes(venueType)) {
    errors.venueType = 'Please select a valid venue location type.';
  }

  // Priorities
  const rawPriorities = Array.isArray(rawInput.priorities) ? rawInput.priorities : [];
  const sanitizedPriorities: Priority[] = rawPriorities.filter((p): p is Priority =>
    VALID_PRIORITIES.includes(p as Priority)
  );

  // Notes
  const sanitizedNotes = sanitizeString(rawInput.notes ?? '', SYSTEM_LIMITS.MAX_NOTES_LENGTH);

  // Currency
  const validCurrencies = ['INR', 'USD', 'EUR'];
  const currency = validCurrencies.includes(rawInput.currency as string)
    ? (rawInput.currency as 'INR' | 'USD' | 'EUR')
    : 'INR';

  // Selected Indian Wedding Functions
  const validFunctions = ['Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception'];
  const selectedFunctions = Array.isArray(rawInput.selectedFunctions)
    ? rawInput.selectedFunctions.filter((f): f is any => validFunctions.includes(f))
    : undefined;

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitizedInput: isValid
      ? {
          eventType,
          eventName,
          eventDate: rawInput.eventDate as string,
          guestCount: rawGuests,
          budget: Math.round(rawBudget * 100) / 100,
          venueType,
          priorities: sanitizedPriorities,
          notes: sanitizedNotes,
          currency,
          selectedFunctions,
        }
      : undefined,
  };
}
