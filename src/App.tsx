/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { EventPlanInput } from './types.ts';
import { createInitialPlan } from './defaultPlan.ts';
import { downloadIcsFile, generateIcsCalendar } from './planner/ics.ts';
import { useChecklistProgress } from './hooks/useChecklistProgress.ts';
import { useDisplayPreferences } from './hooks/useDisplayPreferences.ts';
import { useIdeas } from './hooks/useIdeas.ts';
import { usePlanDerivations } from './hooks/usePlanDerivations.ts';
import { AppFooter } from './components/AppFooter.tsx';
import { AppHeader } from './components/AppHeader.tsx';
import { BudgetSection } from './components/BudgetSection.tsx';
import { ChatBox } from './components/ChatBox.tsx';
import { DashboardStrip } from './components/DashboardStrip.tsx';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { EventForm } from './components/EventForm.tsx';
import { HealthScoreCard } from './components/HealthScoreCard.tsx';
import { IdeasSection } from './components/IdeasSection.tsx';
import { ScenariosSection } from './components/ScenariosSection.tsx';
import { SpendTracker } from './components/SpendTracker.tsx';
import { TimelineSection } from './components/TimelineSection.tsx';
import { VendorChecklist } from './components/VendorChecklist.tsx';
import './styles/app.css';

/** Builds a safe .ics filename from the event name. */
function toIcsFileName(eventName: string): string {
  return `${eventName.replace(/[^\w-]/g, '_').toLowerCase()}_schedule.ics`;
}

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<EventPlanInput>(createInitialPlan);
  const preferences = useDisplayPreferences();
  const { budgetPlan, timelinePlan, vendorList, healthScore, daysUntilEvent } =
    usePlanDerivations(currentPlan);
  const progress = useChecklistProgress(vendorList, timelinePlan);
  const { ideas, isLoading, error, clearError, loadIdeas } = useIdeas(currentPlan);

  const currency = currentPlan.currency || 'INR';

  const handleUpdatePlan = (newPlan: EventPlanInput) => {
    setCurrentPlan(newPlan);
    clearError();
  };

  const handleApplyScenarioBudget = (newBudget: number) => {
    setCurrentPlan((prev) => ({ ...prev, budget: newBudget }));
  };

  const handleCalendarExport = () => {
    if (!timelinePlan) return;
    const icsContent = generateIcsCalendar(currentPlan, timelinePlan);
    downloadIcsFile(icsContent, toIcsFileName(currentPlan.eventName));
  };

  return (
    <div className="app-root">
      {/* Accessibility: Skip to Content landmark */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <AppHeader
        theme={preferences.theme}
        fontSize={preferences.fontSize}
        highContrast={preferences.highContrast}
        onToggleTheme={preferences.toggleTheme}
        onCycleFontSize={preferences.cycleFontSize}
        onToggleContrast={preferences.toggleContrast}
        onExportCalendar={handleCalendarExport}
        onPrint={() => window.print()}
      />

      <main id="main-content" className="main-content" tabIndex={-1}>
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={clearError}
            onRetry={() => loadIdeas(currentPlan, true)}
          />
        )}

        <DashboardStrip
          eventName={currentPlan.eventName}
          daysUntilEvent={daysUntilEvent}
          completed={progress.completed}
          total={progress.total}
          percent={progress.percent}
        />

        <EventForm
          currentPlan={currentPlan}
          onSubmitPlan={handleUpdatePlan}
          isSubmitting={isLoading}
        />

        {healthScore && <HealthScoreCard health={healthScore} />}

        {budgetPlan && (
          <BudgetSection
            budget={budgetPlan}
            guestCount={currentPlan.guestCount}
            currency={currency}
          />
        )}

        {budgetPlan && <SpendTracker categories={budgetPlan.categories} currency={currency} />}

        <ScenariosSection
          currentPlan={currentPlan}
          onApplyScenarioBudget={handleApplyScenarioBudget}
        />

        {timelinePlan && (
          <TimelineSection timeline={timelinePlan} eventDate={currentPlan.eventDate} />
        )}

        {vendorList.length > 0 && <VendorChecklist vendors={vendorList} />}

        <IdeasSection
          ideas={ideas}
          isLoading={isLoading}
          onRefreshIdeas={() => loadIdeas(currentPlan, true)}
        />

        <ChatBox currentPlan={currentPlan} onApplyPlanUpdate={handleUpdatePlan} />
      </main>

      <AppFooter />
    </div>
  );
}