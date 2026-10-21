import { describe, it, expect } from 'vitest';
import { generateTimelinePlan, calculateDaysRemaining } from '../src/planner/timeline.ts';
import { EventPlanInput } from '../src/types.ts';

describe('Timeline Planner Engine', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('calculates days and weeks accurately counting backward from event date', () => {
    // 70 days from 2027-01-01 is 2027-03-12
    const days = calculateDaysRemaining('2027-03-12', refDate);
    expect(days).toBe(70);

    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Spring Wedding',
      eventDate: '2027-03-12',
      guestCount: 100,
      budget: 20000,
      venueType: 'indoor',
      priorities: [],
    };

    const plan = generateTimelinePlan(input, refDate);
    expect(plan.totalWeeks).toBe(10);
    expect(plan.isRushPlan).toBe(false);
    expect(plan.phases.length).toBeGreaterThanOrEqual(3);
  });

  it('triggers rush plan when event date is under 14 days (2 weeks) away', () => {
    // 8 days out
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Last Minute Birthday',
      eventDate: '2027-01-09',
      guestCount: 25,
      budget: 1500,
      venueType: 'home',
      priorities: ['food'],
    };

    const plan = generateTimelinePlan(input, refDate);
    expect(plan.isRushPlan).toBe(true);
    expect(plan.rushNotice).toContain('Rush Plan Active');
    expect(plan.rushNotice).toContain('8 days');

    // Urgent phases
    const immediatePhase = plan.phases.find((p) => p.phaseName.includes('Immediate 48 Hours'));
    expect(immediatePhase).toBeDefined();
    expect(immediatePhase?.tasks.some((t) => t.isPriority)).toBe(true);
  });

  it('strictly rejects past dates with an informative error', () => {
    const input: EventPlanInput = {
      eventType: 'community',
      eventName: 'Past Event',
      eventDate: '2026-12-31', // Before refDate of 2027-01-01
      guestCount: 50,
      budget: 3000,
      venueType: 'indoor',
      priorities: [],
    };

    expect(() => generateTimelinePlan(input, refDate)).toThrowError(
      /Event date must be strictly in the future/i,
    );
  });

  it('handles leap-year boundaries correctly (e.g. 2028 leap year)', () => {
    // 2028 is a leap year (Feb 29 exists)
    const leapRef = new Date('2028-02-25T00:00:00Z');
    // From Feb 25 to March 2 in a leap year is 6 days (25, 26, 27, 28, 29, 1 -> 6 days diff)
    const diff = calculateDaysRemaining('2028-03-02', leapRef);
    expect(diff).toBe(6);

    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Leap Year Party',
      eventDate: '2028-03-02',
      guestCount: 30,
      budget: 2000,
      venueType: 'home',
      priorities: [],
    };
    const plan = generateTimelinePlan(input, leapRef);
    expect(plan.isRushPlan).toBe(true);
  });

  it('generates day-of run-of-show schedule tailored to event type', () => {
    const weddingInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Wedding Ceremony',
      eventDate: '2027-05-15',
      guestCount: 100,
      budget: 25000,
      venueType: 'indoor',
      priorities: [],
    };

    const weddingPlan = generateTimelinePlan(weddingInput, refDate);
    expect(weddingPlan.dayOfSchedule.length).toBeGreaterThan(5);
    expect(weddingPlan.dayOfSchedule.some((s) => s.activity.includes('Ceremony'))).toBe(true);

    const communityInput: EventPlanInput = {
      eventType: 'community',
      eventName: 'Town Gathering',
      eventDate: '2027-05-15',
      guestCount: 400,
      budget: 8000,
      venueType: 'outdoor',
      priorities: [],
    };
    const communityPlan = generateTimelinePlan(communityInput, refDate);
    expect(
      communityPlan.dayOfSchedule.some(
        (s) => s.activity.includes('Keynote') || s.activity.includes('Clean-Up'),
      ),
    ).toBe(true);
  });

  it('generates post-event tasks including rental returns and thank-you notes', () => {
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Post Event Check',
      eventDate: '2027-04-01',
      guestCount: 40,
      budget: 1500,
      venueType: 'home',
      priorities: [],
    };

    const plan = generateTimelinePlan(input, refDate);
    expect(plan.postEventTasks.length).toBeGreaterThanOrEqual(3);
    expect(plan.postEventTasks.some((t) => t.id === 'post-rentals-return')).toBe(true);
    expect(plan.postEventTasks.some((t) => t.id === 'post-thank-you')).toBe(true);
  });
});
