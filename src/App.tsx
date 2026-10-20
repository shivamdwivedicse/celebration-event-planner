/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calendar,
  Download,
  Contrast,
  Moon,
  PartyPopper,
  Printer,
  Sparkles,
  Sun,
  Type as TypeIcon,
} from 'lucide-react';
import { CurrencyCode, EventPlanInput, IdeasResult } from './types.ts';
import { calculateBudgetPlan } from './planner/budget.ts';
import { generateTimelinePlan, calculateDaysRemaining } from './planner/timeline.ts';
import { generateVendorChecklist } from './planner/vendors.ts';
import { calculatePlanHealthScore } from './planner/healthScore.ts';
import { downloadIcsFile, generateIcsCalendar } from './planner/ics.ts';
import { fetchPersonalizedIdeas } from './ai/gemini.ts';
import { EventForm } from './components/EventForm.tsx';
import { HealthScoreCard } from './components/HealthScoreCard.tsx';
import { BudgetSection } from './components/BudgetSection.tsx';
import { SpendTracker } from './components/SpendTracker.tsx';
import { ScenariosSection } from './components/ScenariosSection.tsx';
import { TimelineSection } from './components/TimelineSection.tsx';
import { VendorChecklist } from './components/VendorChecklist.tsx';
import { IdeasSection } from './components/IdeasSection.tsx';
import { ChatBox } from './components/ChatBox.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import './styles/app.css';

function getDefaultFutureDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 75);
  return d.toISOString().split('T')[0];
}

const INITIAL_PLAN: EventPlanInput = {
  eventType: 'wedding',
  eventName: 'Ananya & Rohan Royal Wedding Celebration',
  eventDate: getDefaultFutureDate(),
  guestCount: 200,
  budget: 1800000,
  venueType: 'indoor',
  currency: 'INR',
  selectedFunctions: ['Haldi', 'Mehendi', 'Sangeet', 'Wedding', 'Reception'],
  priorities: ['food', 'photography', 'decor'],
  notes: 'Grand multi-day celebration featuring heritage marigold decor, live dhol, and traditional royal multi-cuisine feast.',
};

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<EventPlanInput>(INITIAL_PLAN);
  const [ideas, setIdeas] = useState<IdeasResult | null>(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // UI Customization States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('celebration_theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      return (localStorage.getItem('celebration_font_size') as any) || 'normal';
    } catch {
      return 'normal';
    }
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('celebration_contrast') === 'high';
    } catch {
      return false;
    }
  });

  // Checklist completion tracking for progress ring
  const [completedTaskCount, setCompletedTaskCount] = useState<number>(0);
  const [totalTaskCount, setTotalTaskCount] = useState<number>(0);

  // Apply theme & font settings to html/body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('celebration_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem('celebration_font_size', fontSize);
    } catch {}
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    try {
      localStorage.setItem('celebration_contrast', highContrast ? 'high' : 'normal');
    } catch {}
  }, [highContrast]);

  // Deterministic computations with useMemo to maximize efficiency
  const budgetPlan = useMemo(() => {
    try {
      return calculateBudgetPlan(currentPlan);
    } catch {
      return null;
    }
  }, [currentPlan]);

  const timelinePlan = useMemo(() => {
    try {
      return generateTimelinePlan(currentPlan);
    } catch {
      return null;
    }
  }, [currentPlan]);

  const vendorList = useMemo(() => {
    try {
      return generateVendorChecklist(currentPlan);
    } catch {
      return [];
    }
  }, [currentPlan]);

  // Plan Health Score
  const healthScore = useMemo(() => {
    if (!budgetPlan || !timelinePlan) return null;
    return calculatePlanHealthScore(currentPlan, budgetPlan, timelinePlan, vendorList);
  }, [currentPlan, budgetPlan, timelinePlan, vendorList]);

  // Calculate days remaining
  const daysUntilEvent = useMemo(() => {
    try {
      return calculateDaysRemaining(currentPlan.eventDate);
    } catch {
      return 0;
    }
  }, [currentPlan.eventDate]);

  // Update overall task completion progress
  useEffect(() => {
    let completed = 0;
    let total = 0;

    // Vendors
    try {
      const storedVendors = localStorage.getItem('celebration_contracted_vendors');
      const vendorMap = storedVendors ? JSON.parse(storedVendors) : {};
      total += vendorList.length;
      for (const v of vendorList) {
        if (vendorMap[v.id]) completed++;
      }
    } catch {}

    // Timeline tasks
    if (timelinePlan) {
      try {
        const storedTimeline = localStorage.getItem('celebration_completed_timeline_tasks');
        const taskMap = storedTimeline ? JSON.parse(storedTimeline) : {};
        for (const phase of timelinePlan.phases) {
          for (const task of phase.tasks) {
            total++;
            if (taskMap[task.id]) completed++;
          }
        }
      } catch {}
    }

    setCompletedTaskCount(completed);
    setTotalTaskCount(Math.max(1, total));
  }, [vendorList, timelinePlan]);

  const completionPct = Math.round((completedTaskCount / Math.max(1, totalTaskCount)) * 100);

  // Load personalized creative ideas when plan changes
  const loadIdeas = useCallback(async (plan: EventPlanInput, forceRefresh = false) => {
    setIsLoadingIdeas(true);
    setGlobalError(null);
    try {
      const result = await fetchPersonalizedIdeas(plan, forceRefresh);
      setIdeas(result);
    } catch {
      setGlobalError('Could not refresh creative ideas. Offline fallback was applied.');
    } finally {
      setIsLoadingIdeas(false);
    }
  }, []);

  useEffect(() => {
    loadIdeas(currentPlan, false);
  }, [currentPlan, loadIdeas]);

  const handleUpdatePlan = (newPlan: EventPlanInput) => {
    setCurrentPlan(newPlan);
    setGlobalError(null);
  };

  const handleApplyScenarioBudget = (newBudget: number) => {
    setCurrentPlan((prev) => ({ ...prev, budget: newBudget }));
  };

  const handleCalendarExport = () => {
    if (!timelinePlan) return;
    const icsContent = generateIcsCalendar(currentPlan, timelinePlan);
    const sanitizedName = currentPlan.eventName.replace(/[^\w-]/g, '_').toLowerCase();
    downloadIcsFile(icsContent, `${sanitizedName}_schedule.ics`);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const cycleFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  const toggleContrast = () => {
    setHighContrast((prev) => !prev);
  };

  // Ring circumference
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPct / 100) * ringCircumference;

  return (
    <div className="app-root">
      {/* Accessibility: Skip to Content landmark */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Semantic Header Landmark */}
      <header className="app-header" role="banner">
        <div className="header-container">
          <div className="brand-wrapper">
            <div className="brand-icon-box" aria-hidden="true">
              <PartyPopper size={24} />
            </div>
            <div>
              <h1 className="app-title">Celebration & Event Planner</h1>
              <p className="app-tagline">
                Deterministic Budgeting & Timeline Assistant with Gemini Contextual Intelligence
              </p>
            </div>
          </div>

          <div className="header-actions">
            {/* Accessibility Controls Toolbar */}
            <div
              className="accessibility-controls"
              role="toolbar"
              aria-label="Display & Accessibility Controls"
            >
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-icon"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <button
                type="button"
                onClick={toggleContrast}
                className={`btn-icon ${highContrast ? 'text-primary' : ''}`}
                title="Toggle High Contrast Mode"
                aria-label="Toggle High Contrast Mode"
                aria-pressed={highContrast}
              >
                <Contrast size={17} />
              </button>

              <button
                type="button"
                onClick={cycleFontSize}
                className="btn-icon"
                title={`Text Size: ${fontSize.toUpperCase()} (Click to change)`}
                aria-label={`Change text size. Currently ${fontSize}`}
              >
                <TypeIcon size={17} />
              </button>
            </div>

            {/* Calendar .ics Export Button */}
            <button
              type="button"
              onClick={handleCalendarExport}
              className="btn btn-secondary btn-sm"
              title="Download iCalendar (.ics) file with milestones & hourly schedule"
              aria-label="Export milestones to iCalendar file"
            >
              <Download size={15} aria-hidden="true" />
              <span>Export .ICS</span>
            </button>

            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              aria-label="Print or save current event plan as PDF"
            >
              <Printer size={15} aria-hidden="true" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Semantic Main Landmark */}
      <main id="main-content" className="main-content" tabIndex={-1}>
        {/* Global Error Notice if applicable */}
        {globalError && (
          <ErrorMessage
            message={globalError}
            onDismiss={() => setGlobalError(null)}
            onRetry={() => loadIdeas(currentPlan, true)}
          />
        )}

        {/* Overview Strip: Countdown, Progress Ring & Confetti when 100% */}
        <div className="dashboard-strip" role="region" aria-label="Event Countdown and Readiness Overview">
          <div className="dashboard-left">
            <div className="countdown-box" role="status" aria-label={`Event countdown: ${daysUntilEvent} days until celebration`}>
              <Calendar size={18} aria-hidden="true" />
              <span>
                {daysUntilEvent > 0
                  ? `🎉 ${daysUntilEvent} Day${daysUntilEvent === 1 ? '' : 's'} to ${currentPlan.eventName}`
                  : `🎉 Celebration is Today!`}
              </span>
            </div>

            <div className="progress-ring-box" role="region" aria-label="Checklist completion ring">
              <svg className="progress-ring-svg" viewBox="0 0 44 44" aria-hidden="true">
                <circle
                  className="progress-ring-bg"
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  className="progress-ring-meter"
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  strokeWidth="4"
                  stroke="#059669"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="progress-ring-text">
                <span className="progress-pct">{completionPct}% Prepared</span>
                <span className="progress-label">{completedTaskCount} of {totalTaskCount} milestones checked</span>
              </div>
            </div>
          </div>

          {completionPct === 100 && (
            <div className="confetti-celebration" role="status">
              <Sparkles size={18} aria-hidden="true" />
              <span>100% Milestone Readiness Achieved! All checklists verified!</span>
            </div>
          )}
        </div>

        {/* 1. Event Input Configuration Form (With INR Currency & Indian Wedding Options) */}
        <EventForm
          currentPlan={currentPlan}
          onSubmitPlan={handleUpdatePlan}
          isSubmitting={isLoadingIdeas}
        />

        {/* 2. Plan Health & Feasibility Score Gauge */}
        {healthScore && <HealthScoreCard health={healthScore} />}

        {/* 3. Budget Allocation Section (Donut Chart & Itemized Breakdown) */}
        {budgetPlan && (
          <BudgetSection
            budget={budgetPlan}
            guestCount={currentPlan.guestCount}
            currency={currentPlan.currency || 'INR'}
          />
        )}

        {/* 4. Actual Spend Tracker & Over-Budget Alerts */}
        {budgetPlan && (
          <SpendTracker
            categories={budgetPlan.categories}
            currency={currentPlan.currency || 'INR'}
          />
        )}

        {/* 5. Scenarios Comparison & Outdoor Weather Backup Plan */}
        <ScenariosSection
          currentPlan={currentPlan}
          onApplyScenarioBudget={handleApplyScenarioBudget}
        />

        {/* 6. Timeline & Execution Roadmap Section */}
        {timelinePlan && (
          <TimelineSection
            timeline={timelinePlan}
            eventDate={currentPlan.eventDate}
          />
        )}

        {/* 7. Vendor Checklist Section */}
        {vendorList.length > 0 && <VendorChecklist vendors={vendorList} />}

        {/* 8. Creative Ideas & Experience Design */}
        <IdeasSection
          ideas={ideas}
          isLoading={isLoadingIdeas}
          onRefreshIdeas={() => loadIdeas(currentPlan, true)}
        />

        {/* 9. Interactive Assistant Chat (Supports both Intent commands and Questions) */}
        <ChatBox
          currentPlan={currentPlan}
          onApplyPlanUpdate={handleUpdatePlan}
        />
      </main>

      {/* Semantic Footer Landmark */}
      <footer className="app-footer" role="contentinfo">
        <div className="footer-container">
          <p>
            Celebration & Event Planner &bull; Deterministic Rules Engine + Gemini Flash Intelligence &bull; Built with accessibility & privacy in mind.
          </p>
          <p className="text-sm text-muted mt-3">
            All budget allocations sum to 100% exactly. Vendor lead times are calculated relative to event date.
          </p>
        </div>
      </footer>
    </div>
  );
}
