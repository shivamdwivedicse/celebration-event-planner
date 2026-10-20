/**
 * Plan Health Score Component.
 * Displays a 0-100 feasibility gauge with ARIA meter semantics,
 * category score breakdown bars, feasibility status badge, and actionable fix recommendations.
 */

import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Lightbulb, ShieldCheck } from 'lucide-react';
import { HealthScoreResult } from '../types.ts';

interface HealthScoreCardProps {
  health: HealthScoreResult;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ health }) => {
  const getStatusColor = (status: HealthScoreResult['status']) => {
    switch (status) {
      case 'excellent':
        return '#059669'; // Emerald
      case 'good':
        return '#2563eb'; // Blue
      case 'fair':
        return '#d97706'; // Amber
      case 'critical':
      default:
        return '#dc2626'; // Red
    }
  };

  const statusColor = getStatusColor(health.status);
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <section className="card health-card" aria-labelledby="health-heading">
      <div className="card-header flex-between">
        <div>
          <div className="title-with-badge">
            <h2 id="health-heading" className="card-title">
              Plan Health & Feasibility Score
            </h2>
            <span
              className={`badge badge-${health.status}`}
              style={{ borderColor: statusColor, color: statusColor }}
            >
              {health.status.toUpperCase()} FEASIBILITY
            </span>
          </div>
          <p className="card-subtitle">
            Deterministic diagnostic measuring budget balance, per-guest funding, vendor lead-time risks, and timeline pace.
          </p>
        </div>
      </div>

      <div className="health-grid">
        {/* Visual Gauge */}
        <div className="health-gauge-col">
          <div
            className="gauge-container"
            role="meter"
            aria-valuenow={health.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Event Feasibility & Plan Health Score"
          >
            <svg className="gauge-svg" viewBox="0 0 100 100" aria-hidden="true">
              <circle
                className="gauge-bg"
                cx="50"
                cy="50"
                r="40"
                strokeWidth="10"
                fill="none"
              />
              <circle
                className="gauge-meter"
                cx="50"
                cy="50"
                r="40"
                strokeWidth="10"
                stroke={statusColor}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="gauge-center-text">
              <span className="gauge-number" style={{ color: statusColor }}>
                {health.score}
              </span>
              <span className="gauge-label">out of 100</span>
            </div>
          </div>

          <p className="gauge-explanation text-sm text-center mt-3">
            {health.score >= 85
              ? 'Your celebration blueprint is robust with balanced reserves and viable margins.'
              : health.score >= 70
              ? 'Solid plan with manageable risks. Review vendor lead times below.'
              : health.score >= 50
              ? 'Moderate friction points identified. Recommended adjustments provided.'
              : 'Critical risks detected. Immediate budget or headcount adjustments advised.'}
          </p>
        </div>

        {/* Category Breakdown & Actionable Fixes */}
        <div className="health-details-col">
          {/* Sub-scores */}
          <div className="health-subscores" aria-label="Feasibility pillar sub-scores">
            <div className="subscore-item">
              <div className="subscore-header">
                <span className="subscore-title">Budget Balance & Reserves</span>
                <span className="subscore-val">{health.categoryScores.budgetBalance} / 25</span>
              </div>
              <div className="subscore-bar-bg" aria-hidden="true">
                <div
                  className="subscore-bar-fill"
                  style={{
                    width: `${(health.categoryScores.budgetBalance / 25) * 100}%`,
                    backgroundColor: '#4f46e5',
                  }}
                />
              </div>
            </div>

            <div className="subscore-item">
              <div className="subscore-header">
                <span className="subscore-title">Per-Guest Allocation Adequacy</span>
                <span className="subscore-val">{health.categoryScores.perGuestAdequacy} / 30</span>
              </div>
              <div className="subscore-bar-bg" aria-hidden="true">
                <div
                  className="subscore-bar-fill"
                  style={{
                    width: `${(health.categoryScores.perGuestAdequacy / 30) * 100}%`,
                    backgroundColor: '#059669',
                  }}
                />
              </div>
            </div>

            <div className="subscore-item">
              <div className="subscore-header">
                <span className="subscore-title">Vendor Lead-Time Status</span>
                <span className="subscore-val">{health.categoryScores.vendorStatus} / 25</span>
              </div>
              <div className="subscore-bar-bg" aria-hidden="true">
                <div
                  className="subscore-bar-fill"
                  style={{
                    width: `${(health.categoryScores.vendorStatus / 25) * 100}%`,
                    backgroundColor: '#d97706',
                  }}
                />
              </div>
            </div>

            <div className="subscore-item">
              <div className="subscore-header">
                <span className="subscore-title">Timeline & Schedule Readiness</span>
                <span className="subscore-val">{health.categoryScores.timelineReadiness} / 20</span>
              </div>
              <div className="subscore-bar-bg" aria-hidden="true">
                <div
                  className="subscore-bar-fill"
                  style={{
                    width: `${(health.categoryScores.timelineReadiness / 20) * 100}%`,
                    backgroundColor: '#0891b2',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Fixes & Insights */}
          <div className="health-insights mt-3">
            {health.fixes.length > 0 && (
              <div className="health-box fixes-box">
                <div className="health-box-header">
                  <Lightbulb size={15} aria-hidden="true" className="text-amber" />
                  <strong>Top Recommended Optimizations:</strong>
                </div>
                <ul className="health-box-list">
                  {health.fixes.map((fix, idx) => (
                    <li key={idx} className="health-box-item">
                      <span className="bullet-point" aria-hidden="true">•</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="health-box reasons-box mt-2">
              <div className="health-box-header">
                <ShieldCheck size={15} aria-hidden="true" className="text-emerald" />
                <strong>Feasibility Highlights:</strong>
              </div>
              <ul className="health-box-list">
                {health.reasons.map((reason, idx) => (
                  <li key={idx} className="health-box-item">
                    <span className="bullet-point" aria-hidden="true">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
