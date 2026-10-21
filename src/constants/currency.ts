/** Per-guest spending benchmarks and currency formatting helpers. */

import { CurrencyCode, EventType } from '../types.ts';

// Benchmarks per guest to trigger warnings, multi-currency calibrated
export const PER_GUEST_BENCHMARKS_BY_CURRENCY: Record<
  CurrencyCode,
  Record<EventType, { criticalMin: number; standardMin: number; recommendedComfort: number }>
> = {
  INR: {
    wedding: { criticalMin: 1800, standardMin: 3500, recommendedComfort: 7000 },
    birthday: { criticalMin: 500, standardMin: 1200, recommendedComfort: 2500 },
    community: { criticalMin: 200, standardMin: 500, recommendedComfort: 1200 },
  },
  USD: {
    wedding: { criticalMin: 35, standardMin: 65, recommendedComfort: 120 },
    birthday: { criticalMin: 12, standardMin: 25, recommendedComfort: 50 },
    community: { criticalMin: 5, standardMin: 12, recommendedComfort: 25 },
  },
  EUR: {
    wedding: { criticalMin: 32, standardMin: 60, recommendedComfort: 110 },
    birthday: { criticalMin: 11, standardMin: 23, recommendedComfort: 48 },
    community: { criticalMin: 4.5, standardMin: 11, recommendedComfort: 23 },
  },
};

// Backward compatible default benchmarks (USD-based)
export const PER_GUEST_BENCHMARKS = PER_GUEST_BENCHMARKS_BY_CURRENCY.USD;

/**
 * Formats monetary amounts using Intl.NumberFormat according to the selected currency.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: { maximumFractionDigits?: number },
): string {
  const localeMap: Record<CurrencyCode, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
  };

  const locale = localeMap[currency] || 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(amount);
}

/**
 * Returns symbol for currency code.
 */
export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
  const symbols: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || '₹';
}