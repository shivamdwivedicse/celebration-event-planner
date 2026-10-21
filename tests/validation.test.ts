import { describe, it, expect } from 'vitest';
import {
  validateEventPlanInput,
  validateFutureDate,
  sanitizeString,
} from '../src/planner/validation.ts';
import { EventPlanInput } from '../src/types.ts';

describe('Input Validation & Sanitization Engine', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('passes a fully valid EventPlanInput and produces sanitized output', () => {
    const valid: Partial<EventPlanInput> = {
      eventType: 'wedding',
      eventName: 'Julia & Mark Wedding',
      eventDate: '2027-08-20',
      guestCount: 120,
      budget: 30000,
      venueType: 'indoor',
      priorities: ['food', 'photography'],
      notes: 'Please include cocktail hour appetizers.',
    };

    const res = validateEventPlanInput(valid, refDate);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
    expect(res.sanitizedInput).toBeDefined();
    expect(res.sanitizedInput?.guestCount).toBe(120);
    expect(res.sanitizedInput?.budget).toBe(30000);
  });

  it('rejects missing or empty form object', () => {
    const res = validateEventPlanInput(null);
    expect(res.isValid).toBe(false);
    expect(res.errors.form).toBeDefined();
  });

  it('rejects negative, zero, and sub-minimum budget', () => {
    const resZero = validateEventPlanInput({ budget: 0 }, refDate);
    expect(resZero.isValid).toBe(false);
    expect(resZero.errors.budget).toContain('at least $50');

    const resNegative = validateEventPlanInput({ budget: -500 }, refDate);
    expect(resNegative.isValid).toBe(false);
    expect(resNegative.errors.budget).toContain('at least $50');

    const resNaN = validateEventPlanInput({ budget: 'abc' as unknown as number }, refDate);
    expect(resNaN.isValid).toBe(false);
    expect(resNaN.errors.budget).toContain('valid number');
  });

  it('rejects budget exceeding sanity maximum limit ($10,000,000)', () => {
    const res = validateEventPlanInput({ budget: 15000000 }, refDate);
    expect(res.isValid).toBe(false);
    expect(res.errors.budget).toContain('cannot exceed');
  });

  it('rejects guest counts < 1, > 10,000, and non-integers', () => {
    const resZero = validateEventPlanInput({ guestCount: 0 }, refDate);
    expect(resZero.errors.guestCount).toContain('at least 1');

    const resOver = validateEventPlanInput({ guestCount: 10001 }, refDate);
    expect(resOver.errors.guestCount).toContain('cannot exceed 10,000');

    const resFloat = validateEventPlanInput({ guestCount: 25.5 }, refDate);
    expect(resFloat.errors.guestCount).toContain('whole number');
  });

  it('rejects invalid enum values for eventType and venueType', () => {
    const res = validateEventPlanInput(
      {
        eventType: 'corporate_meeting' as never,
        venueType: 'spaceship' as never,
      },
      refDate,
    );
    expect(res.errors.eventType).toContain('valid event category');
    expect(res.errors.venueType).toContain('valid venue location');
  });

  it('strips dangerous XSS vectors and script tags from input strings', () => {
    const dangerousInput = '<script>alert("hacked")</script><b>Hello</b> & "Party"';
    const sanitized = sanitizeString(dangerousInput, 100);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).not.toContain('<b>');
    expect(sanitized).toContain('Hello');
  });

  it('validates dates: rejects past dates, malformed formats, and non-existent days like Feb 31', () => {
    // Past date
    const past = validateFutureDate('2026-12-31', refDate);
    expect(past.isValid).toBe(false);
    expect(past.error).toContain('in the future');

    // Malformed regex
    const malformed = validateFutureDate('05/20/2027', refDate);
    expect(malformed.isValid).toBe(false);
    expect(malformed.error).toContain('YYYY-MM-DD');

    // Impossible calendar day: Feb 31
    const feb31 = validateFutureDate('2027-02-31', refDate);
    expect(feb31.isValid).toBe(false);
    expect(feb31.error).toContain('only 28 days exist');

    // Leap year verification: Feb 29 2028 is valid
    const leap2028 = validateFutureDate('2028-02-29', refDate);
    expect(leap2028.isValid).toBe(true);

    // Non leap year: Feb 29 2027 is invalid
    const nonLeap2027 = validateFutureDate('2027-02-29', refDate);
    expect(nonLeap2027.isValid).toBe(false);
  });
});
