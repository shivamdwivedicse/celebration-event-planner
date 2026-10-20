/**
 * Planning Scenarios & Outdoor Weather Contingency Component.
 * Presents Lean, Standard, and Premium tier comparison table computed deterministically,
 * alongside an actionable rain/weather backup plan checklist for outdoor settings.
 */

import React, { useState } from 'react';
import { Check, CloudRain, Layers, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { CurrencyCode, EventPlanInput, PlanScenario } from '../types.ts';
import { calculatePlanScenarios, generateWeatherBackupPlan } from '../planner/scenarios.ts';
import { formatCurrency } from '../config.ts';

interface ScenariosSectionProps {
  currentPlan: EventPlanInput;
  onApplyScenarioBudget: (newBudget: number) => void;
}

export const ScenariosSection: React.FC<ScenariosSectionProps> = ({
  currentPlan,
  onApplyScenarioBudget,
}) => {
  const currency: CurrencyCode = currentPlan.currency || 'INR';
  const scenarios = calculatePlanScenarios(currentPlan);
  const weatherPlan = generateWeatherBackupPlan(currentPlan);

  const [checkedWeatherItems, setCheckedWeatherItems] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('celebration_weather_checklist');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleWeatherItem = (id: string) => {
    setCheckedWeatherItems((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('celebration_weather_checklist', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  };

  return (
    <section className="card scenarios-card" aria-labelledby="scenarios-heading">
      <div className="card-header flex-between">
        <div>
          <h2 id="scenarios-heading" className="card-title">
            Budget Scenarios: Lean vs Standard vs Premium
          </h2>
          <p className="card-subtitle">
            Deterministic model comparisons evaluating trade-offs across tier levels for {currentPlan.guestCount} guests.
          </p>
        </div>
      </div>

      {/* Scenarios 3-Column Comparison Grid */}
      <div className="scenarios-grid" role="list" aria-label="Planning budget scenarios">
        {scenarios.map((scenario) => {
          const isCurrent = Math.abs(scenario.totalBudget - currentPlan.budget) < 10;
          return (
            <div
              key={scenario.tier}
              role="listitem"
              className={`scenario-card scenario-${scenario.tier} ${isCurrent ? 'scenario-active' : ''}`}
            >
              <div className="scenario-card-header">
                <div className="flex-between align-center">
                  <span className={`badge badge-scenario-${scenario.tier}`}>
                    {scenario.tier.toUpperCase()} TIER
                  </span>
                  {isCurrent && (
                    <span className="badge badge-active-plan" role="status">
                      ✓ Active Plan
                    </span>
                  )}
                </div>
                <h3 className="scenario-title mt-2">{scenario.name}</h3>
                <p className="scenario-desc">{scenario.description}</p>
              </div>

              <div className="scenario-price-box">
                <span className="scenario-amount">{formatCurrency(scenario.totalBudget, currency)}</span>
                <span className="scenario-per-guest">
                  ~{formatCurrency(scenario.perGuestCost, currency, { maximumFractionDigits: 1 })} per attendee
                </span>
              </div>

              <div className="scenario-specs-list">
                <div className="spec-row">
                  <strong className="spec-label">Catering:</strong>
                  <span className="spec-value">{scenario.cateringStyle}</span>
                </div>
                <div className="spec-row">
                  <strong className="spec-label">Venue Tier:</strong>
                  <span className="spec-value">{scenario.venueTier}</span>
                </div>
                <div className="spec-row">
                  <strong className="spec-label">Media & Photo:</strong>
                  <span className="spec-value">{scenario.photographyCoverage}</span>
                </div>
                <div className="spec-row">
                  <strong className="spec-label">Music & Sound:</strong>
                  <span className="spec-value">{scenario.entertainmentType}</span>
                </div>
                <div className="spec-row">
                  <strong className="spec-label">Contingency Cushion:</strong>
                  <span className="spec-value">{formatCurrency(scenario.contingencyBuffer, currency)}</span>
                </div>
              </div>

              <div className="scenario-tradeoffs mt-3">
                <span className="tradeoffs-title">Key Trade-offs:</span>
                <ul className="tradeoffs-list">
                  {scenario.tradeoffs.map((item, idx) => (
                    <li key={idx} className="tradeoff-item">
                      <Check size={12} aria-hidden="true" className="tradeoff-check" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!isCurrent && (
                <button
                  type="button"
                  onClick={() => onApplyScenarioBudget(scenario.totalBudget)}
                  className="btn btn-secondary btn-sm scenario-apply-btn mt-3"
                  aria-label={`Adopt ${scenario.name} budget of ${formatCurrency(scenario.totalBudget, currency)}`}
                >
                  <TrendingUp size={14} aria-hidden="true" />
                  <span>Adopt {scenario.name}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Rain / Weather Backup Plan for Outdoor Venues */}
      <div className="weather-backup-section mt-4" aria-labelledby="weather-heading">
        <div className="weather-header flex-between">
          <div className="flex-align-center gap-2">
            <CloudRain size={20} aria-hidden="true" className="text-info" />
            <h3 id="weather-heading" className="weather-title">
              Outdoor Rain & Weather Contingency Protocol
            </h3>
          </div>
          {weatherPlan.requiresRainPlan && (
            <span className="badge badge-priority-high" role="status">
              Outdoor Venue: Weather Plan Mandated
            </span>
          )}
        </div>

        <p className="text-sm text-muted mb-3">
          Unpredictable weather can disrupt outdoor setups. Complete this 5-point safety verification checklist before finalizing outdoor vendor contracts.
        </p>

        <div className="weather-checklist-grid">
          {weatherPlan.checklist.map((item) => {
            const isChecked = Boolean(checkedWeatherItems[item.id]);
            return (
              <label
                key={item.id}
                className={`weather-item-card ${isChecked ? 'weather-item-checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleWeatherItem(item.id)}
                  className="task-checkbox"
                  aria-label={`Verify: ${item.title}`}
                />
                <div className="weather-item-body">
                  <div className="weather-item-top">
                    <span className="weather-item-title">{item.title}</span>
                    <span className={`badge ${item.urgency === 'high' ? 'badge-priority-high' : 'badge-priority-medium'}`}>
                      {item.urgency.toUpperCase()} URGENCY
                    </span>
                  </div>
                  <p className="weather-item-action text-sm text-muted">{item.action}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
};
