import { describe, it, expect } from 'vitest';
import { calculateBudgetPlan } from '../src/planner/budget.ts';
import { BASE_BUDGET_SPLITS } from '../src/config.ts';
import { EventPlanInput, EventType } from '../src/types.ts';

describe('Budget Rule-Based Allocation Engine', () => {
  it('verifies that baseline configuration splits for all event types sum to exactly 100%', () => {
    const eventTypes: EventType[] = ['wedding', 'birthday', 'community'];
    for (const type of eventTypes) {
      const split = BASE_BUDGET_SPLITS[type];
      const sum = split.reduce((acc, cat) => acc + cat.defaultPercentage, 0);
      expect(sum).toBe(100);
    }
  });

  it('guarantees that category amounts sum to total budget exactly for standard wedding', () => {
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Test Wedding',
      eventDate: '2027-06-15',
      guestCount: 120,
      budget: 25000,
      venueType: 'indoor',
      priorities: ['food', 'photography'],
    };

    const result = calculateBudgetPlan(input);
    const sumAmounts = result.categories.reduce((acc, c) => acc + c.amount, 0);
    expect(sumAmounts).toBe(25000);
    expect(result.totalBudget).toBe(25000);

    const sumPct = result.categories.reduce((acc, c) => acc + c.percentage, 0);
    expect(Math.round(sumPct * 10) / 10).toBe(100);
    expect(result.perGuestCost).toBe(208.33);
    expect(result.contingencyPercentage).toBeGreaterThanOrEqual(5);
    expect(result.contingencyPercentage).toBeLessThanOrEqual(10);
  });

  it('guarantees exact sum matching for odd and tiny budget values (rounding reconciliation)', () => {
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Tiny Budget Birthday',
      eventDate: '2027-04-10',
      guestCount: 15,
      budget: 137, // Odd small budget
      venueType: 'home',
      priorities: [],
    };

    const result = calculateBudgetPlan(input);
    const sumAmounts = result.categories.reduce((acc, c) => acc + c.amount, 0);
    expect(sumAmounts).toBe(137);
  });

  it('handles huge budget of $10,000,000 without overflow', () => {
    const input: EventPlanInput = {
      eventType: 'community',
      eventName: 'Grand Community Gala',
      eventDate: '2027-09-01',
      guestCount: 5000,
      budget: 10000000,
      venueType: 'outdoor',
      priorities: ['entertainment', 'venue'],
    };

    const result = calculateBudgetPlan(input);
    const sumAmounts = result.categories.reduce((acc, c) => acc + c.amount, 0);
    expect(sumAmounts).toBe(10000000);
    expect(result.perGuestCost).toBe(2000);
  });

  it('handles minimum guest count of 1 and maximum guest count of 10,000', () => {
    const singleGuestInput: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Solo Celebration',
      eventDate: '2027-05-01',
      guestCount: 1,
      budget: 500,
      venueType: 'home',
      priorities: ['food'],
    };
    const resSingle = calculateBudgetPlan(singleGuestInput);
    expect(resSingle.perGuestCost).toBe(500);

    const maxGuestInput: EventPlanInput = {
      eventType: 'community',
      eventName: 'Megacity Festival',
      eventDate: '2027-05-01',
      guestCount: 10000,
      budget: 200000,
      venueType: 'outdoor',
      priorities: [],
    };
    const resMax = calculateBudgetPlan(maxGuestInput);
    expect(resMax.perGuestCost).toBe(20);
    expect(resMax.warnings.some((w) => w.id === 'large-crowd')).toBe(true);
  });

  it('correctly boosts category allocations when user selects specific priorities', () => {
    const baseInput: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Base Wedding',
      eventDate: '2027-07-20',
      guestCount: 100,
      budget: 20000,
      venueType: 'indoor',
      priorities: [],
    };
    const basePlan = calculateBudgetPlan(baseInput);

    const priorityInput: EventPlanInput = {
      ...baseInput,
      priorities: ['food', 'photography'],
    };
    const prioritizedPlan = calculateBudgetPlan(priorityInput);

    const baseCatering = basePlan.categories.find((c) => c.id === 'catering')!;
    const prioCatering = prioritizedPlan.categories.find((c) => c.id === 'catering')!;
    expect(prioCatering.amount).toBeGreaterThan(baseCatering.amount);

    const basePhoto = basePlan.categories.find((c) => c.id === 'photo')!;
    const prioPhoto = prioritizedPlan.categories.find((c) => c.id === 'photo')!;
    expect(prioPhoto.amount).toBeGreaterThan(basePhoto.amount);
  });

  it('adjusts allocations when venue is set to home or outdoor', () => {
    const indoorInput: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Indoor Bday',
      eventDate: '2027-08-15',
      guestCount: 30,
      budget: 3000,
      venueType: 'indoor',
      priorities: [],
    };
    const homeInput: EventPlanInput = {
      ...indoorInput,
      venueType: 'home',
    };

    const indoorPlan = calculateBudgetPlan(indoorInput);
    const homePlan = calculateBudgetPlan(homeInput);

    const indoorVenue = indoorPlan.categories.find((c) => c.id === 'venue')!;
    const homeVenue = homePlan.categories.find((c) => c.id === 'venue')!;
    expect(homeVenue.percentage).toBeLessThan(indoorVenue.percentage);
  });

  it('triggers critical warning when per-guest cost is below minimum viable threshold', () => {
    const input: EventPlanInput = {
      eventType: 'wedding',
      eventName: 'Underfunded Wedding',
      eventDate: '2027-10-10',
      guestCount: 200,
      budget: 4000, // $20/guest is below critical $35 for wedding
      venueType: 'indoor',
      priorities: [],
    };

    const plan = calculateBudgetPlan(input);
    const critWarning = plan.warnings.find((w) => w.id === 'critical-per-guest');
    expect(critWarning).toBeDefined();
    expect(critWarning?.severity).toBe('critical');
    expect(critWarning?.suggestion).toContain('Increase overall budget');
  });

  it('triggers outdoor logistics warning when outdoor budget is below $4,000', () => {
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Budget Outdoor Party',
      eventDate: '2027-06-01',
      guestCount: 50,
      budget: 2500,
      venueType: 'outdoor',
      priorities: [],
    };

    const plan = calculateBudgetPlan(input);
    const outdoorWarning = plan.warnings.find((w) => w.id === 'outdoor-logistics');
    expect(outdoorWarning).toBeDefined();
    expect(outdoorWarning?.suggestion).toContain('pavilions');
  });

  it('triggers home capacity warning when guests exceed 60 at a private residence', () => {
    const input: EventPlanInput = {
      eventType: 'birthday',
      eventName: 'Huge Backyard Party',
      eventDate: '2027-06-01',
      guestCount: 85,
      budget: 5000,
      venueType: 'home',
      priorities: [],
    };

    const plan = calculateBudgetPlan(input);
    const homeWarning = plan.warnings.find((w) => w.id === 'home-capacity');
    expect(homeWarning).toBeDefined();
    expect(homeWarning?.suggestion).toContain('restroom');
  });
});
