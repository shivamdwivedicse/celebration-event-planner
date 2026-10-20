/**
 * Deterministic rule-based budget allocation engine.
 * Computes category distributions, adjusts for guest count, venue, priorities, and currency,
 * guarantees exact sum matching down to the dollar/rupee, and produces actionable warnings.
 */

import {
  BASE_BUDGET_SPLITS,
  PER_GUEST_BENCHMARKS,
  PER_GUEST_BENCHMARKS_BY_CURRENCY,
  SYSTEM_LIMITS,
  formatCurrency,
} from '../config.ts';
import { BudgetBreakdown, BudgetCategory, BudgetWarning, EventPlanInput } from '../types.ts';

/**
 * Calculates a complete deterministic budget breakdown.
 */
export function calculateBudgetPlan(input: EventPlanInput): BudgetBreakdown {
  const baseCategories = BASE_BUDGET_SPLITS[input.eventType] || BASE_BUDGET_SPLITS.wedding;
  const totalBudget = Math.max(1, Math.round(input.budget));
  const guestCount = Math.max(1, Math.round(input.guestCount));

  // Step 1: Clone baseline percentages
  const percentages: Record<string, number> = {};
  for (const cat of baseCategories) {
    percentages[cat.id] = cat.defaultPercentage;
  }

  // Step 2: Apply Venue adjustments
  if (input.venueType === 'home') {
    // At home, venue rental fees drop dramatically, reallocate to catering, decor, and contingency
    if (percentages.venue) {
      const reduction = Math.min(14, percentages.venue - 4);
      percentages.venue -= reduction;
      if (percentages.catering) percentages.catering += Math.round(reduction * 0.5);
      if (percentages.decor) percentages.decor += Math.round(reduction * 0.3);
      if (percentages.contingency) {
        percentages.contingency += reduction - (Math.round(reduction * 0.5) + Math.round(reduction * 0.3));
      }
    }
  } else if (input.venueType === 'outdoor') {
    // Outdoor requires extra infrastructure (tents, generators, sanitation)
    if (percentages.venue) {
      percentages.venue += 3;
      if (percentages.invitations && percentages.invitations > 2) {
        percentages.invitations -= 1;
      }
      if (percentages.contingency && percentages.contingency > 6) {
        percentages.contingency -= 2;
      }
    }
  }

  // Step 3: Apply Guest Count adjustments
  if (guestCount > 150) {
    // High guest volume drives per-head catering costs up
    if (percentages.catering) percentages.catering += 4;
    if (percentages.photo && percentages.photo > 6) percentages.photo -= 2;
    if (percentages.decor && percentages.decor > 6) percentages.decor -= 2;
  } else if (guestCount < 30) {
    // Low guest volume allows higher investment in photo, decor, and intimacy
    if (percentages.catering && percentages.catering > 20) percentages.catering -= 4;
    if (percentages.photo) percentages.photo += 2;
    if (percentages.decor) percentages.decor += 2;
  }

  // Step 4: Apply User Priorities adjustments
  for (const cat of baseCategories) {
    if (cat.priorityKey && input.priorities.includes(cat.priorityKey)) {
      percentages[cat.id] = (percentages[cat.id] || 0) + 3;
    }
  }

  // Ensure contingency stays strictly between 5% and 10%
  if (percentages.contingency) {
    percentages.contingency = Math.min(
      SYSTEM_LIMITS.MAX_CONTINGENCY_PERCENT - 2, // max 10%
      Math.max(SYSTEM_LIMITS.MIN_CONTINGENCY_PERCENT, percentages.contingency)
    );
  }

  // Step 5: Normalize percentages to sum to exactly 100%
  const currentSum = Object.values(percentages).reduce((acc, p) => acc + p, 0);
  const normalizedPercentages: Record<string, number> = {};

  const categoryKeys = baseCategories.map((c) => c.id);
  categoryKeys.forEach((key, idx) => {
    if (idx === categoryKeys.length - 1) {
      // Last category receives remainder to guarantee exact 100.0%
      const allocatedSoFar = categoryKeys
        .slice(0, idx)
        .reduce((sum, k) => sum + (normalizedPercentages[k] || 0), 0);
      normalizedPercentages[key] = Math.round((100 - allocatedSoFar) * 10) / 10;
    } else {
      const rawPct = (percentages[key] / currentSum) * 100;
      const roundedPct = Math.round(rawPct * 10) / 10;
      normalizedPercentages[key] = roundedPct;
    }
  });

  // Step 6: Convert percentages to whole currency amounts, strictly summing to totalBudget
  let runningAmountSum = 0;
  const rawAmounts: Record<string, number> = {};

  for (const cat of baseCategories) {
    const pct = normalizedPercentages[cat.id];
    const amount = Math.floor((totalBudget * pct) / 100);
    rawAmounts[cat.id] = amount;
    runningAmountSum += amount;
  }

  // Discrepancy reconciliation: assign remaining units to contingency (or largest category)
  let diff = totalBudget - runningAmountSum;
  if (rawAmounts.contingency !== undefined) {
    rawAmounts.contingency += diff;
  } else {
    // If no contingency category, add to largest allocation
    const largestCat = categoryKeys.reduce((maxKey, k) =>
      rawAmounts[k] > rawAmounts[maxKey] ? k : maxKey
    );
    rawAmounts[largestCat] += diff;
  }

  // Build final categories list
  const categories: BudgetCategory[] = baseCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    percentage: normalizedPercentages[cat.id],
    amount: rawAmounts[cat.id],
    description: cat.description,
    color: cat.color,
  }));

  const perGuestCost = Math.round((totalBudget / guestCount) * 100) / 100;
  const contingencyCategory = categories.find((c) => c.id === 'contingency');
  const contingencyReserve = contingencyCategory ? contingencyCategory.amount : 0;
  const contingencyPercentage = contingencyCategory ? contingencyCategory.percentage : 0;

  // Step 7: Benchmark checks and rule-based warnings
  const warnings = generateBudgetWarnings(input, perGuestCost, totalBudget, guestCount);

  return {
    totalBudget,
    perGuestCost,
    contingencyReserve,
    contingencyPercentage,
    categories,
    warnings,
  };
}

/**
 * Generates rule-based actionable warnings and fix recommendations.
 */
function generateBudgetWarnings(
  input: EventPlanInput,
  perGuestCost: number,
  totalBudget: number,
  guestCount: number
): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];
  const currency = input.currency || 'USD';
  const benchmarks =
    (input.currency && PER_GUEST_BENCHMARKS_BY_CURRENCY[input.currency])
      ? PER_GUEST_BENCHMARKS_BY_CURRENCY[input.currency][input.eventType]
      : PER_GUEST_BENCHMARKS[input.eventType];

  if (!benchmarks) return warnings;

  // Warning 1: Critical per-guest cost deficiency
  if (perGuestCost < benchmarks.criticalMin) {
    const suggestedBudget = Math.round(guestCount * benchmarks.standardMin);
    const suggestedGuests = Math.max(1, Math.floor(totalBudget / benchmarks.standardMin));
    warnings.push({
      id: 'critical-per-guest',
      severity: 'critical',
      message: `Your budget of ${formatCurrency(totalBudget, currency)} provides only ${formatCurrency(perGuestCost, currency, { maximumFractionDigits: 2 })} per guest, which is below the minimum viable standard (${formatCurrency(benchmarks.criticalMin, currency)}/guest) for a ${input.eventType}.`,
      suggestion: `Increase overall budget to ~${formatCurrency(suggestedBudget, currency)} or cap guest attendance at ${suggestedGuests} guests to maintain quality.`,
    });
  } else if (perGuestCost < benchmarks.standardMin) {
    // Warning 2: Tight per-guest cost
    warnings.push({
      id: 'tight-budget',
      severity: 'warning',
      message: `At ${formatCurrency(perGuestCost, currency, { maximumFractionDigits: 2 })} per attendee, your budget is tight for standard vendor contracts and seated catering.`,
      suggestion: `Opt for buffet style, live snack stalls, or limited courses instead of elaborate plated banquets.`,
    });
  }

  // Warning 3: Outdoor venue infrastructure risk
  const outdoorThreshold = currency === 'INR' ? 250000 : 4000;
  if (input.venueType === 'outdoor' && totalBudget < outdoorThreshold) {
    warnings.push({
      id: 'outdoor-logistics',
      severity: 'warning',
      message: `Outdoor events require weather contingencies (canopy tents, generator power, portable washrooms).`,
      suggestion: `Check if your outdoor park or space has municipal electrical hookups and shelter pavilions to avoid expensive private rentals.`,
    });
  }

  // Warning 4: Large scale crowd logistics
  if (guestCount > 300) {
    warnings.push({
      id: 'large-crowd',
      severity: 'info',
      message: `Hosting ${guestCount} guests entails municipal crowd management, liability coverage, and parking traffic logistics.`,
      suggestion: `Contact local city or municipal permitting offices at least 8-12 weeks in advance for mass gathering authorizations.`,
    });
  }

  // Warning 5: Home venue capacity reminder
  if (input.venueType === 'home' && guestCount > 60) {
    warnings.push({
      id: 'home-capacity',
      severity: 'warning',
      message: `Hosting ${guestCount} guests in a residential home can overload residential plumbing, parking, and neighborhood noise limits.`,
      suggestion: `Rent a luxury mobile restroom trailer and arrange designated neighborhood parking or rideshare pickup points.`,
    });
  }

  return warnings;
}
