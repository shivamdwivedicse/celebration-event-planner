import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventForm } from '../src/components/EventForm.tsx';
import { BudgetSection } from '../src/components/BudgetSection.tsx';
import { TimelineSection } from '../src/components/TimelineSection.tsx';
import { ChatBox } from '../src/components/ChatBox.tsx';
import { calculateBudgetPlan } from '../src/planner/budget.ts';
import { generateTimelinePlan } from '../src/planner/timeline.ts';
import { EventPlanInput } from '../src/types.ts';

describe('React Component Suite', () => {
  const samplePlan: EventPlanInput = {
    eventType: 'wedding',
    eventName: 'Jessica & Leo Wedding',
    eventDate: '2027-06-20',
    guestCount: 100,
    budget: 25000,
    venueType: 'indoor',
    priorities: ['food', 'photography'],
    notes: 'Classic formal celebration.',
  };

  it('renders EventForm with accessible labels and handles submission', () => {
    const handleSubmit = vi.fn();
    render(<EventForm currentPlan={samplePlan} onSubmitPlan={handleSubmit} />);

    // Check visible labels
    expect(screen.getByLabelText(/Event Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Title \/ Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Generate & Update Master Plan/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('displays validation error in EventForm when event name is too short', () => {
    const handleSubmit = vi.fn();
    render(
      <EventForm currentPlan={{ ...samplePlan, eventName: '' }} onSubmitPlan={handleSubmit} />,
    );

    const submitBtn = screen.getByRole('button', { name: /Generate & Update Master Plan/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/Event name/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('renders BudgetSection with KPI pills and itemized table breakdown', () => {
    const budget = calculateBudgetPlan(samplePlan);
    render(
      <BudgetSection
        budget={budget}
        guestCount={samplePlan.guestCount}
        currency={samplePlan.currency || 'USD'}
      />,
    );

    expect(screen.getByText(/Total Budget/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\$25,000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Catering & Bar Service/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Grand Total \(Exact 100%\)/i)).toBeInTheDocument();
  });

  it('renders TimelineSection and allows toggling tabs and tasks', () => {
    const refDate = new Date('2027-01-01T00:00:00Z');
    const timeline = generateTimelinePlan(samplePlan, refDate);

    render(<TimelineSection timeline={timeline} eventDate={samplePlan.eventDate} />);

    expect(screen.getByRole('tab', { name: /Milestone Countdown/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Day-Of Schedule/i })).toBeInTheDocument();

    // Click Day-Of Schedule tab
    const dayOfTab = screen.getByRole('tab', { name: /Day-Of Schedule/i });
    fireEvent.click(dayOfTab);

    expect(screen.getByText(/Master Run-of-Show/i)).toBeInTheDocument();
  });

  it('handles chat input commands and triggers plan update callback', async () => {
    const handleUpdate = vi.fn();
    render(<ChatBox currentPlan={samplePlan} onApplyPlanUpdate={handleUpdate} />);

    const input = screen.getByPlaceholderText(/Ask a question or type "cut budget 20%"/i);
    const sendBtn = screen.getByRole('button', { name: /Send message to assistant/i });

    fireEvent.change(input, { target: { value: 'cut budget 20%' } });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalled();
    });

    // Verify confirmation message appears in chat
    expect(screen.getByText(/Decreased budget by 20%/i)).toBeInTheDocument();
  });
});
