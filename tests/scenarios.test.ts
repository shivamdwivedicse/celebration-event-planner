import { describe, it, expect } from 'vitest';
import { calculatePlanScenarios, generateWeatherBackupPlan } from '../src/planner/scenarios.ts';
import { EventPlanInput } from '../src/types.ts';

describe('Planning Scenarios & Outdoor Weather Backup Engine', () => {
  const samplePlan: EventPlanInput = {
    eventType: 'wedding',
    eventName: 'Meera & Arjun Wedding',
    eventDate: '2027-07-15',
    guestCount: 200,
    budget: 1000000,
    venueType: 'outdoor',
    currency: 'INR',
    priorities: ['food', 'venue'],
  };

  it('computes Lean, Standard, and Premium scenarios with distinct budget allocations and tradeoffs', () => {
    const scenarios = calculatePlanScenarios(samplePlan);

    expect(scenarios.length).toBe(3);

    const [lean, standard, premium] = scenarios;

    // Tiers
    expect(lean.tier).toBe('lean');
    expect(standard.tier).toBe('standard');
    expect(premium.tier).toBe('premium');

    // Budget scaling
    expect(lean.totalBudget).toBe(750000); // 75% of 1,000,000
    expect(standard.totalBudget).toBe(1000000);
    expect(premium.totalBudget).toBe(1350000); // 135% of 1,000,000

    // Per guest
    expect(lean.perGuestCost).toBe(3750);
    expect(standard.perGuestCost).toBe(5000);
    expect(premium.perGuestCost).toBe(6750);

    // Tradeoffs
    expect(lean.tradeoffs.length).toBeGreaterThanOrEqual(2);
    expect(premium.tradeoffs.length).toBeGreaterThanOrEqual(2);
  });

  it('generates a specialized rain mitigation protocol for outdoor venues', () => {
    const outdoorPlan = generateWeatherBackupPlan(samplePlan);

    expect(outdoorPlan.requiresRainPlan).toBe(true);
    expect(outdoorPlan.checklist.length).toBeGreaterThanOrEqual(4);

    const hasTenting = outdoorPlan.checklist.some((item) => item.id === 'weather-tenting');
    const hasFlooring = outdoorPlan.checklist.some((item) => item.id === 'weather-flooring');
    const hasPower = outdoorPlan.checklist.some((item) => item.id === 'weather-power');

    expect(hasTenting).toBe(true);
    expect(hasFlooring).toBe(true);
    expect(hasPower).toBe(true);
  });

  it('flags indoor venue with lower urgency for rain plan', () => {
    const indoorPlan = generateWeatherBackupPlan({
      ...samplePlan,
      venueType: 'indoor',
    });

    expect(indoorPlan.requiresRainPlan).toBe(false);
  });
});
