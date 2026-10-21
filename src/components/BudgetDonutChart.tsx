/**
 * Animated SVG Donut Chart Component.
 * Features:
 * - Smooth SVG arc calculations for category slices
 * - Central interactive summary display
 * - Visually hidden data table fallback for screen readers
 * - Strict adherence to WCAG AA color accessibility & aria descriptions
 */

import React, { useState } from 'react';
import { BudgetBreakdown, CurrencyCode } from '../types.ts';
import { formatCurrency } from '../config.ts';

interface BudgetDonutChartProps {
  budget: BudgetBreakdown;
  currency?: CurrencyCode;
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({ budget, currency = 'INR' }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const radius = 65;
  const strokeWidth = 26;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDashoffset segments
  let accumulatedPercent = 0;
  const slices = budget.categories.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;

    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = activeCategoryId
    ? budget.categories.find((c) => c.id === activeCategoryId)
    : null;

  return (
    <div className="donut-chart-wrapper" aria-label="Interactive budget distribution donut chart">
      <div className="donut-chart-container">
        <svg
          viewBox="0 0 200 200"
          className="donut-svg"
          role="img"
          aria-labelledby="donut-title donut-desc"
        >
          <title id="donut-title">Budget Allocation Chart</title>
          <desc id="donut-desc">
            Visual donut chart showing distribution across {budget.categories.length} categories
            totaling {formatCurrency(budget.totalBudget, currency)}.
          </desc>

          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.3}
          />

          {/* Segments */}
          {slices.map((slice) => {
            const isHovered = activeCategoryId === slice.id;
            return (
              <circle
                key={slice.id}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                className="donut-slice"
                onMouseEnter={() => setActiveCategoryId(slice.id)}
                onMouseLeave={() => setActiveCategoryId(null)}
                onFocus={() => setActiveCategoryId(slice.id)}
                onBlur={() => setActiveCategoryId(null)}
                tabIndex={0}
                role="button"
                aria-label={`${slice.name}: ${formatCurrency(slice.amount, currency)} (${slice.percentage}%)`}
              />
            );
          })}
        </svg>

        {/* Central Display */}
        <div className="donut-center-info" aria-hidden="true">
          {activeCategory ? (
            <>
              <span className="donut-active-name">{activeCategory.name}</span>
              <strong className="donut-active-amount">
                {formatCurrency(activeCategory.amount, currency)}
              </strong>
              <span className="donut-active-pct">{activeCategory.percentage}% of total</span>
            </>
          ) : (
            <>
              <span className="donut-center-label">Total Planned</span>
              <strong className="donut-center-amount">
                {formatCurrency(budget.totalBudget, currency)}
              </strong>
              <span className="donut-center-sub">100% Allocated</span>
            </>
          )}
        </div>
      </div>

      {/* Visually Hidden Data Table Fallback for Assistive Tech */}
      <div className="sr-only">
        <table>
          <caption>Screen reader itemized budget distribution</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Percentage</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {budget.categories.map((c) => (
              <tr key={c.id}>
                <th scope="row">{c.name}</th>
                <td>{c.percentage}%</td>
                <td>{formatCurrency(c.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
