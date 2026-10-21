/**
 * Spend Tracker Component.
 * Enables live entry of actual expenditures per budget category,
 * calculates planned vs actual variance, alerts on budget overruns (role="alert"),
 * and safeguards persistence in localStorage.
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { BudgetCategory, CurrencyCode } from '../types.ts';
import {
  calculateSpendSummary,
  loadActualSpendsFromStorage,
  saveActualSpendsToStorage,
} from '../planner/spendTracker.ts';
import { formatCurrency } from '../config.ts';

interface SpendTrackerProps {
  categories: BudgetCategory[];
  currency?: CurrencyCode;
}

export const SpendTracker: React.FC<SpendTrackerProps> = ({ categories, currency = 'INR' }) => {
  const [actualSpends, setActualSpends] = useState<Record<string, number>>(() =>
    loadActualSpendsFromStorage(),
  );

  const summary = calculateSpendSummary(categories, actualSpends);

  const handleSpendChange = (categoryId: string, valStr: string) => {
    const parsed = valStr === '' ? 0 : Math.max(0, parseFloat(valStr) || 0);
    const updated = {
      ...actualSpends,
      [categoryId]: parsed,
    };
    setActualSpends(updated);
    saveActualSpendsToStorage(updated);
  };

  const handleResetSpends = () => {
    setActualSpends({});
    saveActualSpendsToStorage({});
  };

  return (
    <section className="card spend-tracker-card" aria-labelledby="spend-tracker-heading">
      <div className="card-header flex-between">
        <div>
          <h2 id="spend-tracker-heading" className="card-title">
            Actual Spend Tracker & Variance
          </h2>
          <p className="card-subtitle">
            Record invoice payments and actual vendor disbursements to monitor your budget remaining
            in real-time.
          </p>
        </div>

        <div className="spend-header-actions">
          <button
            type="button"
            onClick={handleResetSpends}
            className="btn btn-outline btn-sm"
            aria-label="Clear all recorded actual spends"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset Spends</span>
          </button>
        </div>
      </div>

      {/* Over-Budget Alert Banner */}
      {summary.overBudgetCategories.length > 0 && (
        <div className="overdue-summary-banner" role="alert" aria-live="assertive">
          <AlertCircle size={20} aria-hidden="true" className="overdue-icon" />
          <div className="overdue-summary-text">
            <strong>Budget Deficit Alert:</strong>
            <p className="text-sm">
              {summary.overBudgetCategories.length} categor
              {summary.overBudgetCategories.length === 1 ? 'y has' : 'ies have'} exceeded planned
              allocations:{' '}
              {summary.overBudgetCategories
                .map(
                  (c) =>
                    `${c.categoryName} (${formatCurrency(Math.abs(c.variance), currency)} over)`,
                )
                .join(', ')}
              .
            </p>
          </div>
        </div>
      )}

      {/* KPI Overview Pills */}
      <div className="budget-kpis mb-3" role="region" aria-label="Spend Tracker Highlights">
        <div className="kpi-pill">
          <DollarSign size={16} aria-hidden="true" className="kpi-icon text-indigo" />
          <div>
            <span className="kpi-label">Total Planned</span>
            <strong className="kpi-value">{formatCurrency(summary.totalPlanned, currency)}</strong>
          </div>
        </div>

        <div className="kpi-pill">
          {summary.isOverallOverBudget ? (
            <TrendingUp size={16} aria-hidden="true" className="kpi-icon text-danger" />
          ) : (
            <TrendingDown size={16} aria-hidden="true" className="kpi-icon text-emerald" />
          )}
          <div>
            <span className="kpi-label">Total Actual Spent</span>
            <strong className="kpi-value">{formatCurrency(summary.totalActual, currency)}</strong>
          </div>
        </div>

        <div className="kpi-pill">
          <CheckCircle2 size={16} aria-hidden="true" className="kpi-icon text-amber" />
          <div>
            <span className="kpi-label">Budget Remaining</span>
            <strong
              className={`kpi-value ${summary.totalRemaining < 0 ? 'text-danger' : 'text-emerald'}`}
            >
              {formatCurrency(summary.totalRemaining, currency)} ({summary.totalPercentSpent}%
              spent)
            </strong>
          </div>
        </div>
      </div>

      {/* Itemized Spend Entry Table */}
      <div className="table-responsive">
        <table className="data-table" aria-label="Actual spend vs planned budget table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="text-right">
                Planned Allocation
              </th>
              <th scope="col" style={{ width: '13rem' }}>
                Actual Spent ({currency})
              </th>
              <th scope="col" className="text-right">
                Variance / Remaining
              </th>
              <th scope="col">Progress</th>
            </tr>
          </thead>
          <tbody>
            {summary.categorySpends.map((item) => (
              <tr key={item.categoryId} className={item.isOverBudget ? 'row-overbudget' : ''}>
                <th scope="row" className="category-cell">
                  <span className="category-title">{item.categoryName}</span>
                </th>
                <td className="text-right font-medium">
                  {formatCurrency(item.plannedAmount, currency)}
                </td>
                <td>
                  <div className="spend-input-wrapper">
                    <label htmlFor={`spend-${item.categoryId}`} className="sr-only">
                      Actual spend for {item.categoryName}
                    </label>
                    <input
                      id={`spend-${item.categoryId}`}
                      type="number"
                      min={0}
                      step={50}
                      value={actualSpends[item.categoryId] ?? ''}
                      onChange={(e) => handleSpendChange(item.categoryId, e.target.value)}
                      placeholder="0"
                      className={`form-input spend-table-input ${item.isOverBudget ? 'is-invalid' : ''}`}
                    />
                  </div>
                </td>
                <td
                  className={`text-right font-semibold ${item.isOverBudget ? 'text-danger' : 'text-emerald'}`}
                >
                  {item.variance >= 0
                    ? `+${formatCurrency(item.variance, currency)}`
                    : `-${formatCurrency(Math.abs(item.variance), currency)}`}
                </td>
                <td style={{ minWidth: '8rem' }}>
                  <div className="spend-progress-bg" aria-hidden="true">
                    <div
                      className="spend-progress-fill"
                      style={{
                        width: `${Math.min(100, item.percentSpent)}%`,
                        backgroundColor: item.isOverBudget ? '#dc2626' : '#059669',
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted">{item.percentSpent}%</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="table-total-row">
              <th scope="row">Net Spending Total</th>
              <td className="text-right font-bold">
                {formatCurrency(summary.totalPlanned, currency)}
              </td>
              <td className="font-bold">{formatCurrency(summary.totalActual, currency)}</td>
              <td
                className={`text-right font-bold ${summary.totalRemaining < 0 ? 'text-danger' : 'text-emerald'}`}
              >
                {summary.totalRemaining >= 0
                  ? `+${formatCurrency(summary.totalRemaining, currency)}`
                  : `-${formatCurrency(Math.abs(summary.totalRemaining), currency)}`}
              </td>
              <td className="font-bold">{summary.totalPercentSpent}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
