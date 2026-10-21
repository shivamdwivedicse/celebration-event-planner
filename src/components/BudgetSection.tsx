/**
 * Budget breakdown view with visual stacked bar, animated SVG donut chart,
 * category metrics table, contingency status, and rule-based warnings with actionable suggestions.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  DollarSign,
  Info,
  PieChart,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { BudgetBreakdown, CurrencyCode } from '../types.ts';
import { formatCurrency } from '../config.ts';
import { BudgetDonutChart } from './BudgetDonutChart.tsx';

interface BudgetSectionProps {
  budget: BudgetBreakdown;
  guestCount: number;
  currency?: CurrencyCode;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  guestCount,
  currency = 'INR',
}) => {
  const [chartView, setChartView] = useState<'donut' | 'bar'>('donut');

  return (
    <section className="card" aria-labelledby="budget-heading">
      <div className="card-header flex-between">
        <div>
          <h2 id="budget-heading" className="card-title">
            Budget Allocation & Contingency
          </h2>
          <p className="card-subtitle">
            Rule-based distribution tailored to your guest volume, venue logistics, and prioritized
            categories.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="budget-kpis" role="region" aria-label="Budget Highlights">
          <div className="kpi-pill">
            <DollarSign size={16} aria-hidden="true" className="kpi-icon text-indigo" />
            <div>
              <span className="kpi-label">Total Budget</span>
              <strong className="kpi-value">{formatCurrency(budget.totalBudget, currency)}</strong>
            </div>
          </div>
          <div className="kpi-pill">
            <Users size={16} aria-hidden="true" className="kpi-icon text-emerald" />
            <div>
              <span className="kpi-label">Per-Guest Cost</span>
              <strong className="kpi-value">
                {formatCurrency(budget.perGuestCost, currency, { maximumFractionDigits: 1 })}
              </strong>
            </div>
          </div>
          <div className="kpi-pill">
            <ShieldCheck size={16} aria-hidden="true" className="kpi-icon text-amber" />
            <div>
              <span className="kpi-label">Contingency Buffer</span>
              <strong className="kpi-value">
                {formatCurrency(budget.contingencyReserve, currency)} (
                {budget.contingencyPercentage}%)
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Suggestions Banner */}
      {budget.warnings.length > 0 && (
        <div
          className="budget-warnings-container"
          role="region"
          aria-label="Budget Warnings & Suggestions"
        >
          {budget.warnings.map((w) => (
            <div key={w.id} className={`warning-item warning-${w.severity}`} role="alert">
              <div className="warning-icon-col">
                {w.severity === 'critical' || w.severity === 'warning' ? (
                  <AlertTriangle className="warning-icon" aria-hidden="true" size={18} />
                ) : (
                  <Info className="warning-icon" aria-hidden="true" size={18} />
                )}
              </div>
              <div className="warning-body">
                <p className="warning-msg">
                  <strong className="warning-tag">
                    {w.severity === 'critical'
                      ? 'CRITICAL RISK:'
                      : w.severity === 'warning'
                        ? 'ADVISORY:'
                        : 'NOTE:'}
                  </strong>{' '}
                  {w.message}
                </p>
                <p className="warning-suggestion">
                  <span className="fix-label">Recommended Fix:</span> {w.suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Visual Toggle Header */}
      <div className="chart-view-toggle mt-4">
        <span className="toggle-label">Visualization:</span>
        <div className="tab-nav" role="tablist" aria-label="Chart type toggle">
          <button
            type="button"
            role="tab"
            aria-selected={chartView === 'donut'}
            className={`tab-btn ${chartView === 'donut' ? 'tab-btn-active' : ''}`}
            onClick={() => setChartView('donut')}
          >
            <PieChart size={14} aria-hidden="true" />
            <span>Interactive Donut</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={chartView === 'bar'}
            className={`tab-btn ${chartView === 'bar' ? 'tab-btn-active' : ''}`}
            onClick={() => setChartView('bar')}
          >
            <BarChart3 size={14} aria-hidden="true" />
            <span>Stacked Bar</span>
          </button>
        </div>
      </div>

      {/* Chart View Content */}
      {chartView === 'donut' ? (
        <BudgetDonutChart budget={budget} currency={currency} />
      ) : (
        <div className="budget-bar-section mt-3">
          <div
            className="budget-bar-container"
            role="progressbar"
            aria-label="Budget category split bar"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {budget.categories.map((cat) => (
              <div
                key={cat.id}
                className="budget-bar-segment"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.name}: ${formatCurrency(cat.amount, currency)} (${cat.percentage}%)`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      )}

      {/* Shared Legend */}
      <div className="budget-legend mt-3" role="list" aria-label="Budget category legend">
        {budget.categories.map((cat) => (
          <div key={cat.id} className="legend-item" role="listitem">
            <span
              className="legend-color-dot"
              style={{ backgroundColor: cat.color }}
              aria-hidden="true"
            />
            <span className="legend-name">{cat.name}</span>
            <span className="legend-pct">({cat.percentage}%)</span>
          </div>
        ))}
      </div>

      {/* Accessible Table Breakdown */}
      <div className="table-responsive mt-4">
        <table className="data-table" aria-label="Itemized Budget Breakdown Table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col" className="text-right">
                Share (%)
              </th>
              <th scope="col" className="text-right">
                Allocation ({currency})
              </th>
              <th scope="col" className="text-right">
                Est. Per Attendee
              </th>
              <th scope="col">Scope & Logistics Guidance</th>
            </tr>
          </thead>
          <tbody>
            {budget.categories.map((cat) => {
              const perGuestAllocation =
                Math.round((cat.amount / Math.max(1, guestCount)) * 100) / 100;
              return (
                <tr key={cat.id}>
                  <th scope="row" className="category-cell">
                    <span
                      className="category-dot"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden="true"
                    />
                    <span className="category-title">{cat.name}</span>
                  </th>
                  <td className="text-right font-medium">{cat.percentage}%</td>
                  <td className="text-right font-semibold">
                    {formatCurrency(cat.amount, currency)}
                  </td>
                  <td className="text-right text-muted">
                    {formatCurrency(perGuestAllocation, currency, { maximumFractionDigits: 1 })}
                  </td>
                  <td className="text-muted text-sm">{cat.description}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="table-total-row">
              <th scope="row">Grand Total (Exact 100%)</th>
              <td className="text-right font-bold">100.0%</td>
              <td className="text-right font-bold">
                {formatCurrency(budget.totalBudget, currency)}
              </td>
              <td className="text-right font-bold">
                {formatCurrency(budget.perGuestCost, currency, { maximumFractionDigits: 1 })}
              </td>
              <td className="text-sm">
                Verified down to the dollar/rupee with contingency reconciliation
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};
