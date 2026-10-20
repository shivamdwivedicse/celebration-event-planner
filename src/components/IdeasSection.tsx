/**
 * Ideas & Creative Concepts Section.
 * Renders theme aesthetics with color palettes, interactive guest activities,
 * and seasonal menu concepts. Clearly badges source ('ai' vs 'fallback').
 */

import React from 'react';
import { Bot, Palette, Sparkles, Utensils, Zap, Clock, Users } from 'lucide-react';
import { IdeasResult } from '../types.ts';

interface IdeasSectionProps {
  ideas: IdeasResult | null;
  isLoading: boolean;
  onRefreshIdeas: () => void;
}

export const IdeasSection: React.FC<IdeasSectionProps> = ({
  ideas,
  isLoading,
  onRefreshIdeas,
}) => {
  if (!ideas && !isLoading) {
    return null;
  }

  const isAiSource = ideas?.source === 'ai';

  return (
    <section className="card" aria-labelledby="ideas-heading">
      <div className="card-header flex-between">
        <div>
          <div className="title-with-badge">
            <h2 id="ideas-heading" className="card-title">
              Creative Concepts & Experience Design
            </h2>
            {ideas && (
              <span
                className={`badge ${isAiSource ? 'badge-ai' : 'badge-fallback'}`}
                title={isAiSource ? 'Personalized via Gemini 3.8 Flash' : 'Curated domain strategy'}
              >
                {isAiSource ? (
                  <>
                    <Sparkles size={12} aria-hidden="true" />
                    <span>Gemini 3.8 AI Generated</span>
                  </>
                ) : (
                  <>
                    <Bot size={12} aria-hidden="true" />
                    <span>Curated Offline Guide</span>
                  </>
                )}
              </span>
            )}
            {ideas?.cached && (
              <span className="badge badge-cached" title="Retrieved instantly from cache">
                Cached
              </span>
            )}
          </div>
          <p className="card-subtitle">
            Thematic inspiration, crowd engagement, and dining concepts harmonized with your venue and budget.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshIdeas}
          disabled={isLoading}
          className="btn btn-secondary btn-sm"
          aria-label="Refresh and regenerate creative event ideas"
        >
          <Zap size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          <span>{isLoading ? 'Synthesizing Concepts...' : 'Refresh Ideas'}</span>
        </button>
      </div>

      {isLoading && !ideas && (
        <div className="ideas-loading-skeleton" role="status" aria-live="polite">
          <div className="skeleton-box" />
          <div className="skeleton-box" />
          <div className="skeleton-box" />
          <span className="sr-only">Formulating custom theme concepts...</span>
        </div>
      )}

      {ideas && (
        <div className="ideas-content">
          {/* Sub-section 1: Theme Concepts */}
          <div className="ideas-block">
            <h3 className="ideas-subheading">
              <Palette size={16} aria-hidden="true" className="ideas-icon text-indigo" />
              Tailored Theme Aesthetics & Ambience
            </h3>

            <div className="themes-grid" role="list" aria-label="Theme concept cards">
              {ideas.themeIdeas.map((theme, idx) => (
                <div key={idx} className="theme-card" role="listitem">
                  <h4 className="theme-title">{theme.title}</h4>
                  <p className="theme-description">{theme.description}</p>
                  <div className="decor-notes">
                    <strong className="decor-notes-label">Atmosphere & Styling:</strong> {theme.decorNotes}
                  </div>
                  {Array.isArray(theme.colorPalette) && theme.colorPalette.length > 0 && (
                    <div className="palette-row" aria-label={`Color palette: ${theme.colorPalette.join(', ')}`}>
                      <span className="palette-label">Palette:</span>
                      <div className="palette-swatches">
                        {theme.colorPalette.map((color, cIdx) => (
                          <span
                            key={cIdx}
                            className="swatch"
                            style={{ backgroundColor: color }}
                            title={color}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 2: Interactive Activities */}
          <div className="ideas-block mt-4">
            <h3 className="ideas-subheading">
              <Sparkles size={16} aria-hidden="true" className="ideas-icon text-amber" />
              Guest Engagement & Entertainment Rituals
            </h3>

            <div className="activities-grid" role="list" aria-label="Guest activities">
              {ideas.activities.map((act, idx) => (
                <div key={idx} className="activity-card" role="listitem">
                  <div className="activity-head">
                    <h4 className="activity-title">{act.title}</h4>
                    <span className="activity-duration">
                      <Clock size={12} aria-hidden="true" />
                      {act.durationMinutes} min
                    </span>
                  </div>
                  <p className="activity-desc">{act.description}</p>
                  <div className="activity-target">
                    <Users size={12} aria-hidden="true" />
                    <span>Audience: <strong>{act.targetGroup}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-section 3: Curated Menu Suggestions */}
          <div className="ideas-block mt-4">
            <h3 className="ideas-subheading">
              <Utensils size={16} aria-hidden="true" className="ideas-icon text-emerald" />
              Dining Concepts & Beverage Pairings
            </h3>

            <div className="menus-grid" role="list" aria-label="Curated menu suggestions">
              {ideas.menuSuggestions.map((menu, idx) => (
                <div key={idx} className="menu-card" role="listitem">
                  <h4 className="menu-style">{menu.style}</h4>
                  <ul className="menu-items-list">
                    {menu.items.map((item, mIdx) => (
                      <li key={mIdx} className="menu-item-entry">
                        <span className="bullet-point" aria-hidden="true">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {menu.notes && (
                    <div className="menu-notes">
                      <strong className="menu-notes-label">Service Tip:</strong> {menu.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
