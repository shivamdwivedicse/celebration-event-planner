/**
 * Spend Tracker calculation & local persistence module.
 * Compares planned budget allocations vs actual user expenditures,
 * computes category variances, flags over-budget categories, and guarantees safe local storage access.
 */

import { BudgetCategory, CategorySpend, SpendTrackerSummary } from '../types.ts';

const STORAGE_KEY = 'celebration_actual_spend';

/**
 * Computes complete spend metrics and variance analysis.
 */
export function calculateSpendSummary(
  categories: BudgetCategory[],
  actualSpends: Record<string, number>
): SpendTrackerSummary {
  let totalPlanned = 0;
  let totalActual = 0;

  const categorySpends: CategorySpend[] = categories.map((cat) => {
    const planned = cat.amount;
    const actual = Math.max(0, Number(actualSpends[cat.id]) || 0);

    totalPlanned += planned;
    totalActual += actual;

    const variance = planned - actual; // Positive = money remaining; Negative = deficit
    const percentSpent = planned > 0 ? Math.round((actual / planned) * 100) : 0;
    const isOverBudget = actual > planned;

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      plannedAmount: planned,
      actualAmount: actual,
      variance,
      percentSpent,
      isOverBudget,
    };
  });

  const totalRemaining = totalPlanned - totalActual;
  const totalPercentSpent = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
  const isOverallOverBudget = totalActual > totalPlanned;
  const overBudgetCategories = categorySpends.filter((c) => c.isOverBudget);

  return {
    totalPlanned,
    totalActual,
    totalRemaining,
    totalPercentSpent,
    isOverallOverBudget,
    categorySpends,
    overBudgetCategories,
  };
}

/**
 * Loads actual category expenditures from localStorage with try/catch safeguard.
 */
export function loadActualSpendsFromStorage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const sanitized: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'number' && !isNaN(v) && v >= 0) {
          sanitized[k] = v;
        }
      }
      return sanitized;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Persists actual category expenditures to localStorage with try/catch safeguard.
 */
export function saveActualSpendsToStorage(spends: Record<string, number>): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spends));
    return true;
  } catch {
    return false;
  }
}
