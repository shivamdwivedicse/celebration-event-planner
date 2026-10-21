import { describe, it, expect } from 'vitest';
import { validateEventPlanInput } from '../src/planner/validation.ts';
import { calculateBudgetPlan } from '../src/planner/budget.ts';
import { generateTimelinePlan } from '../src/planner/timeline.ts';
import { generateVendorChecklist } from '../src/planner/vendors.ts';
import { calculatePlanHealthScore } from '../src/planner/healthScore.ts';
import { parseChatIntent } from '../src/planner/chatIntent.ts';
import { generateIcsCalendar } from '../src/planner/ics.ts';
import { EventPlanInput } from '../src/types.ts';

describe('End-to-End Planning Flow Integration Test', () => {
  const refDate = new Date('2027-01-01T00:00:00Z');

  it('completes the full flow: form input -> plan -> chat adjustment -> calendar export', () => {
    // Step 1: User fills out form
    const rawInput: Partial<EventPlanInput> = {
      eventType: 'wedding',
      eventName: 'Deepika & Ranveer Wedding',
      eventDate: '2027-06-15',
      guestCount: 150,
      budget: 1500000,
      venueType: 'indoor',
      currency: 'INR',
      priorities: ['food', 'photography'],
      notes: 'Royal banquet with live acoustic music',
    };

    const valResult = validateEventPlanInput(rawInput, refDate);
    expect(valResult.isValid).toBe(true);
    expect(valResult.sanitizedInput).toBeDefined();

    const plan = valResult.sanitizedInput!;

    // Step 2: Generate master plan derivations
    const initialBudget = calculateBudgetPlan(plan);
    const initialTimeline = generateTimelinePlan(plan, refDate);
    const initialVendors = generateVendorChecklist(plan, refDate);
    const initialHealth = calculatePlanHealthScore(
      plan,
      initialBudget,
      initialTimeline,
      initialVendors,
    );

    expect(initialBudget.totalBudget).toBe(1500000);
    expect(initialBudget.categories.reduce((acc, c) => acc + c.amount, 0)).toBe(1500000);
    expect(initialHealth.score).toBeGreaterThanOrEqual(70);

    // Step 3: User issues a conversational adjustment via chat ("cut budget 20%")
    const chatMessage = 'Please cut budget 20% to stay within our family limit';
    const intentResult = parseChatIntent(chatMessage, plan);

    expect(intentResult.matched).toBe(true);
    expect(intentResult.type).toBe('modify_budget_percentage');
    expect(intentResult.newBudget).toBe(1200000); // 1,500,000 - 300,000

    // Step 4: Apply mutation to master plan
    const updatedPlan: EventPlanInput = {
      ...plan,
      budget: intentResult.newBudget!,
    };

    // Step 5: Recalculate deterministic models with updated budget
    const updatedBudget = calculateBudgetPlan(updatedPlan);
    const updatedHealth = calculatePlanHealthScore(
      updatedPlan,
      updatedBudget,
      initialTimeline,
      initialVendors,
    );

    expect(updatedBudget.totalBudget).toBe(1200000);
    const sumCategories = updatedBudget.categories.reduce((acc, c) => acc + c.amount, 0);
    expect(sumCategories).toBe(1200000); // Guarantees exact sum matching down to the rupee!
    expect(updatedHealth.score).toBeDefined();

    // Step 6: Generate RFC 5545 iCalendar export
    const icsContent = generateIcsCalendar(updatedPlan, initialTimeline);

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('Deepika & Ranveer Wedding');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('END:VEVENT');
    expect(icsContent).toContain('END:VCALENDAR');

    // Verify day-of events are scheduled for 20270615
    expect(icsContent).toContain('20270615');
  });
});
