/**
 * RFC 5545 compliant iCalendar (.ics) generator.
 * Creates downloadable calendar files for milestone tasks and day-of schedule events.
 * Strict text escaping per RFC 5545 (backslashes, semicolons, commas, and newlines).
 */

import { EventPlanInput, TimelinePlan } from '../types.ts';

/**
 * Escapes plain text for RFC 5545 iCalendar values.
 * Escapes backslashes (\), semicolons (;), commas (,), and newlines.
 */
export function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

/**
 * Formats a Date object as a UTC timestamp string YYYYMMDDTHHmmssZ.
 */
export function formatIcsTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Formats a YYYY-MM-DD date string with optional day offset as YYYYMMDD.
 */
export function formatIcsDate(dateStr: string, dayOffset = 0): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  if (dayOffset !== 0) {
    dateObj.setUTCDate(dateObj.getUTCDate() + dayOffset);
  }
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Parses a 12-hour time string like "08:30 AM" or "04:00 PM" into hours and minutes (24h).
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    return { hours: 10, minutes: 0 };
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = (match[3] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Generates an RFC 5545 valid .ics calendar string.
 */
export function generateIcsCalendar(input: EventPlanInput, timeline: TimelinePlan): string {
  const dtstamp = formatIcsTimestamp();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celebration and Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(input.eventName)} Master Plan`,
    'X-WR-TIMEZONE:UTC',
  ];

  // 1. Add Milestone Timeline Tasks
  for (const phase of timeline.phases) {
    for (const task of phase.tasks) {
      // Calculate task milestone date based on weekOffset (e.g. -8 weeks = -56 days)
      const dayOffset = task.weekOffset * 7;
      const taskDate = formatIcsDate(input.eventDate, dayOffset);
      const uid = `task-${task.id}-${taskDate}@celebrationplanner.app`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${taskDate}`,
        `DTEND;VALUE=DATE:${taskDate}`,
        `SUMMARY:[${escapeIcsText(task.category)}] ${escapeIcsText(task.title)}`,
        `DESCRIPTION:${escapeIcsText(task.description)}\\nPhase: ${escapeIcsText(phase.phaseName)}`,
        'STATUS:CONFIRMED',
        task.isPriority ? 'PRIORITY:1' : 'PRIORITY:5',
        'END:VEVENT',
      );
    }
  }

  // 2. Add Day-Of Run-of-Show Hourly Schedule items
  const eventDateDigits = formatIcsDate(input.eventDate);

  for (let i = 0; i < timeline.dayOfSchedule.length; i++) {
    const item = timeline.dayOfSchedule[i];
    const { hours, minutes } = parseTimeString(item.time);

    const startH = String(hours).padStart(2, '0');
    const startM = String(minutes).padStart(2, '0');

    // Approximate 1 hour duration or until next slot
    const endHours = (hours + 1) % 24;
    const endH = String(endHours).padStart(2, '0');

    const dtStart = `${eventDateDigits}T${startH}${startM}00`;
    const dtEnd = `${eventDateDigits}T${endH}${startM}00`;
    const uid = `dayof-${i}-${eventDateDigits}-${startH}${startM}@celebrationplanner.app`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcsText(input.eventName)}: ${escapeIcsText(item.activity)}`,
      `DESCRIPTION:${escapeIcsText(item.details)}\\nLead: ${escapeIcsText(item.assignedRole)}`,
      'STATUS:CONFIRMED',
      'PRIORITY:1',
      'END:VEVENT',
    );
  }

  // 3. Add Post-Event Tasks
  for (const task of timeline.postEventTasks) {
    const dayOffset = Math.max(1, task.weekOffset * 7);
    const postDate = formatIcsDate(input.eventDate, dayOffset);
    const uid = `post-${task.id}-${postDate}@celebrationplanner.app`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${postDate}`,
      `DTEND;VALUE=DATE:${postDate}`,
      `SUMMARY:[Wrap-Up] ${escapeIcsText(task.title)}`,
      `DESCRIPTION:${escapeIcsText(task.description)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a client-side download of the calendar .ics file.
 */
export function downloadIcsFile(icsContent: string, filename = 'event-schedule.ics'): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
