import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateSpendSummary,
  loadActualSpendsFromStorage,
  saveActualSpendsToStorage,
} from '../src/planner/spendTracker.ts';
import { BudgetCategory } from '../src/types.ts';

describe('Spend Tracker & Variance Engine', () => {
  const mockCategories: BudgetCategory[] = [
    {
      id: 'venue',
      name: 'Venue & Rentals',
      percentage: 30,
      amount: 3000,
      description: 'Site and furniture',
      color: '#4f46e5',
    },
    {
      id: 'catering',
      name: 'Catering & Bar',
      percentage: 40,
      amount: 4000,
      description: 'Food and drinks',
      color: '#059669',
    },
    {
      id: 'photo',
      name: 'Photography',
      percentage: 20,
      amount: 2000,
      description: 'Photo and video',
      color: '#0891b2',
    },
    {
      id: 'contingency',
      name: 'Contingency',
      percentage: 10,
      amount: 1000,
      description: 'Safety cushion',
      color: '#64748b',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('accurately computes variance and remaining budget when under planned amounts', () => {
    const actualSpends = {
      venue: 2500, // $500 under
      catering: 3500, // $500 under
      photo: 1800, // $200 under
    };

    const summary = calculateSpendSummary(mockCategories, actualSpends);

    expect(summary.totalPlanned).toBe(10000);
    expect(summary.totalActual).toBe(7800);
    expect(summary.totalRemaining).toBe(2200);
    expect(summary.totalPercentSpent).toBe(78);
    expect(summary.isOverallOverBudget).toBe(false);
    expect(summary.overBudgetCategories.length).toBe(0);

    const venueSpend = summary.categorySpends.find((c) => c.categoryId === 'venue')!;
    expect(venueSpend.variance).toBe(500);
    expect(venueSpend.isOverBudget).toBe(false);
  });

  it('flags over-budget categories and sets negative variance when actual exceeds planned', () => {
    const actualSpends = {
      venue: 3500, // $500 over planned $3,000!
      catering: 4000, // exact
      photo: 2400, // $400 over planned $2,000!
    };

    const summary = calculateSpendSummary(mockCategories, actualSpends);

    expect(summary.overBudgetCategories.length).toBe(2);

    const venueSpend = summary.categorySpends.find((c) => c.categoryId === 'venue')!;
    expect(venueSpend.isOverBudget).toBe(true);
    expect(venueSpend.variance).toBe(-500);
    expect(venueSpend.percentSpent).toBe(117);

    const photoSpend = summary.categorySpends.find((c) => c.categoryId === 'photo')!;
    expect(photoSpend.isOverBudget).toBe(true);
    expect(photoSpend.variance).toBe(-400);

    // Total actual is 9900 out of 10000 (overall still within contingency)
    expect(summary.isOverallOverBudget).toBe(false);
  });

  it('safely handles localStorage reads and writes without throwing', () => {
    const data = { venue: 1200, catering: 3400 };
    const saved = saveActualSpendsToStorage(data);
    expect(saved).toBe(true);

    const loaded = loadActualSpendsFromStorage();
    expect(loaded.venue).toBe(1200);
    expect(loaded.catering).toBe(3400);

    // Test corrupted JSON handling in storage
    localStorage.setItem('celebration_actual_spend', '{corrupted_json');
    const safeLoaded = loadActualSpendsFromStorage();
    expect(safeLoaded).toEqual({});
  });
});
