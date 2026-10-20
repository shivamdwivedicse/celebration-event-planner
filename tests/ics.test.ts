import { describe, it, expect } from 'vitest';
import {
  escapeIcsText,
  formatIcsDate,
  formatIcsTimestamp,
  parseTimeString,
  generateIcsCalendar,
  downloadIcsFile,
} from '../src/planner/ics.ts';
import { generateTimelinePlan } from '../src/planner/timeline.ts';
import { EventPlanInput } from '../src/types.ts';

describe('iCalendar (.ics) RFC 5545 Export Engine', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('escapes characters strictly per RFC 5545 (backslashes, semicolons, commas, newlines)', () => {
    const rawText = 'Welcome; to our wedding, featuring a \\ special gift\nNew line here\r\nSecond line';
    const escaped = escapeIcsText(rawText);

    expect(escaped).toContain('\\;');
    expect(escaped).toContain('\\,');
    expect(escaped).toContain('\\\\');
    expect(escaped).not.toContain('\r');
    expect(escaped).toContain('\\nNew line here\\nSecond line');
  });

  it('formats calendar dates and handles day offsets across months and leap years', () => {
    // Normal date
    expect(formatIcsDate('2027-05-15')).toBe('20270515');

    // Day offset crossing month boundary
    expect(formatIcsDate('2027-05-02', -5)).toBe('20270427');

    // Leap year leap day boundary: 2028-03-02 minus 2 days is 2028-02-29
    expect(formatIcsDate('2028-03-02', -2)).toBe('20280229');
  });

  it('parses 12-hour AM/PM time strings accurately into 24-hour time', () => {
    expect(parseTimeString('08:00 AM')).toEqual({ hours: 8, minutes: 0 });
    expect(parseTimeString('12:00 PM')).toEqual({ hours: 12, minutes: 0 });
    expect(parseTimeString('04:30 PM')).toEqual({ hours: 16, minutes: 30 });
    expect(parseTimeString('11:45 PM')).toEqual({ hours: 23, minutes: 45 });
    expect(parseTimeString('12:15 AM')).toEqual({ hours: 0, minutes: 15 });
  });

  it('generates a syntactically valid RFC 5545 VCALENDAR payload', () => {
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Julia & Leo Celebration, & Party;',
      eventDate: '2027-06-20',
      guestCount: 120,
      budget: 25000,
      venueType: 'indoor',
      currency: 'USD',
      priorities: ['food'],
    };

    const timeline = generateTimelinePlan(input, refDate);
    const icsContent = generateIcsCalendar(input, timeline);

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('PRODID:-//Celebration and Event Planner//EN');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('STATUS:CONFIRMED');
    expect(icsContent).toContain('END:VEVENT');
    expect(icsContent).toContain('END:VCALENDAR');

    // Check CRLF formatting
    expect(icsContent).toContain('\r\n');

    // Check summary has escaped characters
    expect(icsContent).toContain('Julia & Leo Celebration\\, & Party\\;');
  });

  it('handles download safely in node / browser environment without throwing', () => {
    const result = downloadIcsFile('BEGIN:VCALENDAR\r\nEND:VCALENDAR', 'test.ics');
    // In node/jsdom, if mock window or blob exists, returns true or false safely
    expect(typeof result).toBe('boolean');
  });
});
