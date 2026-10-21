import { useMemo } from 'react';
import { calculateBudgetPlan } from '../planner/budget.ts';
import { calculateDaysRemaining, generateTimelinePlan } from '../planner/timeline.ts';
import { generateVendorChecklist } from '../planner/vendors.ts';
import { calculatePlanHealthScore } from '../planner/healthScore.ts';
import { EventPlanInput } from '../types.ts';

/**
 * Derives every deterministic result (budget, timeline, vendors, health score,
 * countdown) from the current plan. Memoized so the AI is never involved and
 * nothing recomputes unless the plan changes.
 */
export function usePlanDerivations(plan: EventPlanInput) {
  const budgetPlan = useMemo(() => {
    try {
      return calculateBudgetPlan(plan);
    } catch {
      return null;
    }
  }, [plan]);

  const timelinePlan = useMemo(() => {
    try {
      return generateTimelinePlan(plan);
    } catch {
      return null;
    }
  }, [plan]);

  const vendorList = useMemo(() => {
    try {
      return generateVendorChecklist(plan);
    } catch {
      return [];
    }
  }, [plan]);

  const healthScore = useMemo(() => {
    if (!budgetPlan || !timelinePlan) return null;
    return calculatePlanHealthScore(plan, budgetPlan, timelinePlan, vendorList);
  }, [plan, budgetPlan, timelinePlan, vendorList]);

  const daysUntilEvent = useMemo(() => {
    try {
      return calculateDaysRemaining(plan.eventDate);
    } catch {
      return 0;
    }
  }, [plan.eventDate]);

  return { budgetPlan, timelinePlan, vendorList, healthScore, daysUntilEvent };
}