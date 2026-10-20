/**
 * Vendor Checklist component.
 * Displays tailored vendor contracts with lead times, budget weights,
 * overdue warnings, suggested interview questions, and localStorage persistence.
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, ShieldAlert } from 'lucide-react';
import { VendorItem } from '../types.ts';

interface VendorChecklistProps {
  vendors: VendorItem[];
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({ vendors }) => {
  const [contractedMap, setContractedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('celebration_contracted_vendors');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'contracted'>('all');

  const toggleContracted = (id: string) => {
    setContractedMap((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('celebration_contracted_vendors', JSON.stringify(updated));
      } catch {
        // Safe fallback
      }
      return updated;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedVendorId((prev) => (prev === id ? null : id));
  };

  const overdueCount = vendors.filter((v) => v.isOverdue && !contractedMap[v.id]).length;
  const contractedCount = vendors.filter((v) => contractedMap[v.id]).length;

  const filteredVendors = vendors.filter((v) => {
    if (filter === 'overdue') return v.isOverdue && !contractedMap[v.id];
    if (filter === 'contracted') return contractedMap[v.id];
    return true;
  });

  return (
    <section className="card" aria-labelledby="vendor-heading">
      <div className="card-header flex-between">
        <div>
          <h2 id="vendor-heading" className="card-title">
            Vendor Sourcing & Contracts
          </h2>
          <p className="card-subtitle">
            Industry lead-time benchmarks with dynamic overdue flags to prevent date contention.
          </p>
        </div>

        {/* Filter controls */}
        <div className="vendor-filters" role="group" aria-label="Filter vendors by status">
          <button
            type="button"
            className={`btn btn-sm ${filter === 'all' ? 'btn-secondary-active' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({vendors.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'overdue' ? 'btn-danger-active' : 'btn-outline-danger'}`}
            onClick={() => setFilter('overdue')}
          >
            <AlertCircle size={14} aria-hidden="true" />
            Overdue Booking ({overdueCount})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filter === 'contracted' ? 'btn-success-active' : 'btn-outline-success'}`}
            onClick={() => setFilter('contracted')}
          >
            <CheckCircle2 size={14} aria-hidden="true" />
            Contracted ({contractedCount})
          </button>
        </div>
      </div>

      {/* Overdue alert summary banner */}
      {overdueCount > 0 && filter !== 'contracted' && (
        <div className="overdue-summary-banner" role="alert">
          <ShieldAlert size={20} aria-hidden="true" className="overdue-icon" />
          <div className="overdue-summary-text">
            <strong>{overdueCount} Vendor{overdueCount === 1 ? '' : 's'} Past Standard Lead Time:</strong>
            <p className="text-sm">
              Securing these partners is critical. Popular local vendors book out fast for your celebration date.
            </p>
          </div>
        </div>
      )}

      {/* Vendor Cards Grid */}
      <div className="vendor-grid" role="list" aria-label="Vendor partner cards">
        {filteredVendors.map((vendor) => {
          const isContracted = Boolean(contractedMap[vendor.id]);
          const isExpanded = expandedVendorId === vendor.id;

          return (
            <div
              key={vendor.id}
              role="listitem"
              className={`vendor-card ${isContracted ? 'vendor-contracted' : ''} ${
                vendor.isOverdue && !isContracted ? 'vendor-overdue-border' : ''
              }`}
            >
              <div className="vendor-card-main">
                <div className="vendor-card-top">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isContracted}
                      onChange={() => toggleContracted(vendor.id)}
                      aria-label={`Mark ${vendor.title} as contracted`}
                    />
                    <span className="checkbox-custom" aria-hidden="true" />
                    <span className="vendor-title-text">{vendor.title}</span>
                  </label>

                  <div className="vendor-badges">
                    {vendor.isOverdue && !isContracted && (
                      <span className="badge badge-overdue" role="status">
                        ⚠️ Overdue Lead Time
                      </span>
                    )}
                    <span className={`badge badge-priority-${vendor.priority}`}>
                      {vendor.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="vendor-meta-row">
                  <span className="vendor-category text-muted">
                    Category: <strong>{vendor.category}</strong>
                  </span>
                  <span className="vendor-leadtime">
                    Lead time: <strong>{vendor.leadTimeWeeks} weeks</strong>
                  </span>
                  <span className="vendor-share">
                    Budget share: <strong>~{vendor.budgetSharePercent}%</strong>
                  </span>
                </div>
              </div>

              {/* Collapsible Questions for Vendor Interview */}
              {vendor.suggestedQuestions.length > 0 && (
                <div className="vendor-questions-wrapper">
                  <button
                    type="button"
                    onClick={() => toggleExpand(vendor.id)}
                    className="btn-text-link questions-toggle-btn"
                    aria-expanded={isExpanded}
                    aria-controls={`questions-${vendor.id}`}
                  >
                    <HelpCircle size={14} aria-hidden="true" />
                    <span>Interview Checklist ({vendor.suggestedQuestions.length} Questions)</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div id={`questions-${vendor.id}`} className="vendor-questions-panel">
                      <p className="questions-intro">Ask during initial consultation:</p>
                      <ul className="questions-list">
                        {vendor.suggestedQuestions.map((q, idx) => (
                          <li key={idx} className="question-item">
                            <span className="question-number" aria-hidden="true">Q{idx + 1}:</span>
                            <span className="question-text">{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
