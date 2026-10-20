import { describe, it, expect } from 'vitest';
import { calculatePlanHealthScore } from '../src/planner/healthScore.ts';
import { calculateBudgetPlan } from '../src/planner/budget.ts';
import { generateTimelinePlan } from '../src/planner/timeline.ts';
import { generateVendorChecklist } from '../src/planner/vendors.ts';
import { EventPlanInput } from '../src/types.ts';

describe('Plan Health Score Engine', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('computes a high feasibility score (>=85) for an amply funded, well-paced event', () => {
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Grand Wedding',
      eventDate: '2027-08-01', // 30 weeks out
      guestCount: 100,
      budget: 35000,
      venueType: 'indoor',
      currency: 'USD',
      priorities: ['food', 'photography'],
    };

    const budget = calculateBudgetPlan(input);
    const timeline = generateTimelinePlan(input, refDate);
    const vendors = generateVendorChecklist(input, refDate);

    const health = calculatePlanHealthScore(input, budget, timeline, vendors);

    expect(health.score).toBeGreaterThanOrEqual(85);
    expect(health.status).toBe('excellent');
    expect(health.categoryScores.budgetBalance).toBeGreaterThanOrEqual(20);
    expect(health.categoryScores.perGuestAdequacy).toBe(30);
    expect(health.categoryScores.vendorStatus).toBe(25);
    expect(health.categoryScores.timelineReadiness).toBe(20);
    expect(health.reasons.length).toBeGreaterThan(0);
  });

  it('penalizes health score when multiple vendors are overdue and event is in rush mode', () => {
    const rushInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Rush Wedding',
      eventDate: '2027-01-08', // 7 days out!
      guestCount: 150,
      budget: 15000,
      venueType: 'indoor',
      currency: 'USD',
      priorities: [],
    };

    const budget = calculateBudgetPlan(rushInput);
    const timeline = generateTimelinePlan(rushInput, refDate);
    const vendors = generateVendorChecklist(rushInput, refDate);

    const health = calculatePlanHealthScore(rushInput, budget, timeline, vendors);

    // Overdue vendors + rush mode should noticeably reduce score
    expect(health.categoryScores.timelineReadiness).toBe(8);
    expect(health.categoryScores.vendorStatus).toBeLessThan(15);
    expect(health.score).toBeLessThan(75);
    expect(health.fixes.length).toBeGreaterThan(0);
    expect(health.fixes.some((f) => f.includes('critical path') || f.includes('Fast-track'))).toBe(true);
  });

  it('penalizes per-guest adequacy when budget is critically insufficient', () => {
    const tightInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Underfunded Wedding',
      eventDate: '2027-06-01',
      guestCount: 200,
      budget: 3000, // $15/guest is below critical $35 for wedding
      venueType: 'indoor',
      currency: 'USD',
      priorities: [],
    };

    const budget = calculateBudgetPlan(tightInput);
    const timeline = generateTimelinePlan(tightInput, refDate);
    const vendors = generateVendorChecklist(tightInput, refDate);

    const health = calculatePlanHealthScore(tightInput, budget, timeline, vendors);

    expect(health.categoryScores.perGuestAdequacy).toBe(4);
    expect(health.status).toBe('critical');
    expect(health.fixes.some((f) => f.includes('Increase overall budget'))).toBe(true);
  });

  it('supports INR currency calibrated adequacy scoring', () => {
    const inrInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Indian Royal Wedding',
      eventDate: '2027-09-01',
      guestCount: 200,
      budget: 1800000, // ₹9,000/guest > ₹7,000 comfort benchmark
      venueType: 'indoor',
      currency: 'INR',
      priorities: ['food', 'decor'],
    };

    const budget = calculateBudgetPlan(inrInput);
    const timeline = generateTimelinePlan(inrInput, refDate);
    const vendors = generateVendorChecklist(inrInput, refDate);

    const health = calculatePlanHealthScore(inrInput, budget, timeline, vendors);

    expect(health.categoryScores.perGuestAdequacy).toBe(30);
    expect(health.score).toBeGreaterThanOrEqual(80);
  });

  it('penalizes contingency when under 5% or when moderate budget warnings occur', () => {
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Moderate Plan',
      eventDate: '2027-01-28', // 4 weeks out
      guestCount: 30,
      budget: 600, // tight per guest: $20/guest is between critical 12 and standard 25
      venueType: 'indoor',
      currency: 'USD',
      priorities: [],
    };

    const budget = calculateBudgetPlan(input);
    // Simulate low contingency
    const customBudget = {
      ...budget,
      contingencyPercentage: 4,
    };
    const timeline = generateTimelinePlan(input, refDate);
    const vendors = generateVendorChecklist(input, refDate);

    const health = calculatePlanHealthScore(input, customBudget, timeline, vendors);

    expect(health.categoryScores.budgetBalance).toBeLessThanOrEqual(15);
    expect(health.categoryScores.timelineReadiness).toBe(15); // 4 weeks out
    expect(health.categoryScores.perGuestAdequacy).toBe(14); // tight budget
    expect(health.fixes.some((f) => f.includes('contingency') || f.includes('headcount'))).toBe(true);
  });
});
