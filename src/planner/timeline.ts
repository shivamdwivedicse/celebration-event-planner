/**
 * Deterministic date-based timeline planner.
 * Calculates week-by-week milestones counting backward from the target event date,
 * detects rush scenarios under 2 weeks with prioritized critical path tasks,
 * validates against past dates and leap years, and generates day-of & post-event schedules.
 */

import { EventPlanInput, TimelinePlan } from '../types.ts';
import { generateDayOfSchedule } from './timeline/dayOfSchedule.ts';
import { generateRushPhases, generateStandardPhases } from './timeline/phases.ts';
import { generatePostEventTasks } from './timeline/postEvent.ts';

/**
 * Computes difference in calendar days between reference date and event date (UTC-normalized).
 */
export function calculateDaysRemaining(
  eventDateStr: string,
  referenceDate: Date = new Date(),
): number {
  const [year, month, day] = eventDateStr.split('-').map(Number);
  const eventUTC = Date.UTC(year, month - 1, day);
  const refUTC = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  );

  const diffMs = eventUTC - refUTC;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates the full TimelinePlan based on event input and calendar math.
 */
export function generateTimelinePlan(
  input: EventPlanInput,
  referenceDate: Date = new Date(),
): TimelinePlan {
  const daysRemaining = calculateDaysRemaining(input.eventDate, referenceDate);

  if (daysRemaining <= 0) {
    throw new Error('Event date must be strictly in the future. Past dates cannot be scheduled.');
  }

  const totalWeeks = Math.max(0, Math.floor(daysRemaining / 7));
  const isRushPlan = totalWeeks < 2;

  let rushNotice: string | undefined;
  if (isRushPlan) {
    rushNotice = `Rush Plan Active: Celebration is only ${daysRemaining} day${
      daysRemaining === 1 ? '' : 's'
    } away! Routine timelines have been compressed into an accelerated critical path focusing on venue, food, and essentials.`;
  }

  const phases = isRushPlan
    ? generateRushPhases(input, daysRemaining)
    : generateStandardPhases(input, totalWeeks);

  const dayOfSchedule = generateDayOfSchedule(input);
  const postEventTasks = generatePostEventTasks(input);

  return {
    isRushPlan,
    totalWeeks,
    rushNotice,
    phases,
    dayOfSchedule,
    postEventTasks,
  };
}
