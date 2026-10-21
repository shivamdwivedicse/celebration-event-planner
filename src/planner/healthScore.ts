/**
 * Deterministic Plan Health Score Engine.
 * Evaluates event feasibility on a 0-100 scale analyzing:
 * 1. Budget balance & contingency adequacy (25 pts)
 * 2. Per-guest financial adequacy (30 pts)
 * 3. Vendor booking timeline & overdue risks (25 pts)
 * 4. Overall timeline readiness (20 pts)
 * Returns score, status, detailed reasons, and actionable fix suggestions.
 */

import { PER_GUEST_BENCHMARKS_BY_CURRENCY, PER_GUEST_BENCHMARKS } from '../config.ts';
import {
  BudgetBreakdown,
  EventPlanInput,
  HealthScoreResult,
  TimelinePlan,
  VendorItem,
} from '../types.ts';

/**
 * Calculates a comprehensive Plan Health Score (0-100).
 */
export function calculatePlanHealthScore(
  input: EventPlanInput,
  budget: BudgetBreakdown,
  timeline: TimelinePlan,
  vendors: VendorItem[],
): HealthScoreResult {
  const reasons: string[] = [];
  const fixes: string[] = [];

  // --- Dimension 1: Budget Balance & Contingency (max 25 pts) ---
  let budgetBalance = 25;
  const contingencyPct = budget.contingencyPercentage;

  if (contingencyPct >= 6 && contingencyPct <= 10) {
    reasons.push(`Contingency reserve is healthy at ${contingencyPct}% of overall budget.`);
  } else if (contingencyPct >= 5) {
    budgetBalance -= 5;
    reasons.push(`Contingency reserve (${contingencyPct}%) is on the lower threshold.`);
    fixes.push('Allocate an extra 2-3% to your contingency buffer for unexpected emergencies.');
  } else {
    budgetBalance -= 12;
    reasons.push(`Contingency reserve (${contingencyPct}%) is critically underfunded.`);
    fixes.push('Increase contingency reserve to at least 7-8% of total budget.');
  }

  // Deduct points for critical or warning budget issues
  const criticalWarnings = budget.warnings.filter((w) => w.severity === 'critical');
  const moderateWarnings = budget.warnings.filter((w) => w.severity === 'warning');

  if (criticalWarnings.length > 0) {
    budgetBalance = Math.max(0, budgetBalance - 10);
    reasons.push(`${criticalWarnings.length} critical financial discrepancy detected.`);
  } else if (moderateWarnings.length > 0) {
    budgetBalance = Math.max(0, budgetBalance - 5);
  }

  budgetBalance = Math.max(0, Math.min(25, budgetBalance));

  // --- Dimension 2: Per-Guest Financial Adequacy (max 30 pts) ---
  let perGuestAdequacy = 30;
  const benchmarks =
    input.currency && PER_GUEST_BENCHMARKS_BY_CURRENCY[input.currency]
      ? PER_GUEST_BENCHMARKS_BY_CURRENCY[input.currency][input.eventType]
      : PER_GUEST_BENCHMARKS[input.eventType];

  const perGuest = budget.perGuestCost;

  if (benchmarks) {
    if (perGuest >= benchmarks.recommendedComfort) {
      reasons.push(
        `Per-guest allocation is comfortable, affording premium dining and guest hospitality.`,
      );
    } else if (perGuest >= benchmarks.standardMin) {
      perGuestAdequacy = 23;
      reasons.push(`Per-guest budget is balanced for standard market rates.`);
    } else if (perGuest >= benchmarks.criticalMin) {
      perGuestAdequacy = 14;
      reasons.push(`Per-guest funding is tight for standard vendor packages.`);
      fixes.push(
        'Consider narrowing the guest list or shifting to buffet/station dining to maintain quality.',
      );
    } else {
      perGuestAdequacy = 4;
      reasons.push(`Per-guest funding is below minimal viable benchmark for this event type.`);
      fixes.push(
        `Increase overall budget or trim guest count to reach at least minimum viable per-guest rate.`,
      );
    }
  }

  perGuestAdequacy = Math.max(0, Math.min(30, perGuestAdequacy));

  // --- Dimension 3: Vendor Booking Status (max 25 pts) ---
  let vendorStatus = 25;
  const overdueVendors = vendors.filter((v) => v.isOverdue);

  if (overdueVendors.length === 0) {
    reasons.push('All required vendor booking lead times are fully on track.');
  } else {
    const penalty = Math.min(25, overdueVendors.length * 7);
    vendorStatus = Math.max(0, 25 - penalty);
    reasons.push(
      `${overdueVendors.length} key vendor${overdueVendors.length === 1 ? '' : 's'} past standard booking lead time.`,
    );
    fixes.push(
      `Fast-track contracts immediately for overdue partners: ${overdueVendors
        .slice(0, 2)
        .map((v) => v.title)
        .join(', ')}.`,
    );
  }

  // --- Dimension 4: Timeline Readiness (max 20 pts) ---
  let timelineReadiness = 20;

  if (timeline.isRushPlan) {
    timelineReadiness = 8;
    reasons.push('Event is under 14 days out; executing on high-urgency rush plan.');
    fixes.push(
      'Focus exclusively on the 48-hour critical path tasks: venue access, catering drop-off, and RSVPs.',
    );
  } else if (timeline.totalWeeks <= 4) {
    timelineReadiness = 15;
    reasons.push('Final countdown phase: 4 or fewer weeks remaining.');
    fixes.push(
      'Lock in finalized headcount and circulate the day-of run-of-show schedule to all vendors.',
    );
  } else {
    reasons.push('Timeline milestones are well-paced with ample planning buffer.');
  }

  // Final Composite Score calculation
  let totalScore = Math.min(
    100,
    Math.max(0, Math.round(budgetBalance + perGuestAdequacy + vendorStatus + timelineReadiness)),
  );

  let status: 'critical' | 'fair' | 'good' | 'excellent';
  if (criticalWarnings.length > 0 || perGuestAdequacy <= 5) {
    status = 'critical';
    totalScore = Math.min(48, totalScore);
  } else if (totalScore >= 85) {
    status = 'excellent';
  } else if (totalScore >= 70) {
    status = 'good';
  } else if (totalScore >= 50) {
    status = 'fair';
  } else {
    status = 'critical';
  }

  return {
    score: totalScore,
    status,
    reasons,
    fixes,
    categoryScores: {
      budgetBalance,
      perGuestAdequacy,
      vendorStatus,
      timelineReadiness,
    },
  };
}
