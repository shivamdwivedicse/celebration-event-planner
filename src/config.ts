/**
 * Central configuration entry point for Celebration & Event Planner.
 * System limits live here; larger data tables are split into src/constants/
 * and re-exported so existing imports keep working.
 */

export const SYSTEM_LIMITS = {
  MIN_BUDGET: 50,
  MAX_BUDGET: 10_000_000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 10_000,
  MAX_NAME_LENGTH: 120,
  MAX_NOTES_LENGTH: 500,
  MAX_CHAT_INPUT_LENGTH: 400,
  DEFAULT_CONTINGENCY_PERCENT: 8,
  MIN_CONTINGENCY_PERCENT: 5,
  MAX_CONTINGENCY_PERCENT: 12,
  AI_REQUEST_TIMEOUT_MS: 9000,
  AI_MAX_RETRIES: 1,
  LRU_CACHE_MAX_ENTRIES: 50,
} as const;

export { BASE_BUDGET_SPLITS } from './constants/budgetSplits.ts';
export type { CategoryDefinition } from './constants/budgetSplits.ts';
export {
  PER_GUEST_BENCHMARKS,
  PER_GUEST_BENCHMARKS_BY_CURRENCY,
  formatCurrency,
  getCurrencySymbol,
} from './constants/currency.ts';
export { DEFAULT_PRESETS } from './constants/presets.ts';
export { INDIAN_WEDDING_FUNCTIONS } from './constants/weddingFunctions.ts';