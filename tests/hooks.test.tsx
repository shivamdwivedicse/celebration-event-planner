import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { nextFontSize, useDisplayPreferences } from '../src/hooks/useDisplayPreferences.ts';
import { useChecklistProgress } from '../src/hooks/useChecklistProgress.ts';
import { usePlanDerivations } from '../src/hooks/usePlanDerivations.ts';
import { useEventForm } from '../src/hooks/useEventForm.ts';
import { createInitialPlan, getDefaultFutureDate } from '../src/defaultPlan.ts';
import { generateDayOfSchedule } from '../src/planner/timeline/dayOfSchedule.ts';
import { AppHeader } from '../src/components/AppHeader.tsx';
import { DashboardStrip } from '../src/components/DashboardStrip.tsx';
import { EventPlanInput, TimelinePlan, VendorItem } from '../src/types.ts';

function futurePlan(overrides: Partial<EventPlanInput> = {}): EventPlanInput {
  return { ...createInitialPlan(), ...overrides };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('default plan', () => {
  it('computes a future ISO date and a valid initial plan', () => {
    const date = getDefaultFutureDate(10);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(date).getTime()).toBeGreaterThan(Date.now());
    const plan = createInitialPlan();
    expect(plan.eventType).toBe('wedding');
    expect(plan.currency).toBe('INR');
    expect(plan.priorities.length).toBeGreaterThan(0);
  });
});

describe('useDisplayPreferences', () => {
  it('cycles font size normal -> large -> xlarge -> normal', () => {
    expect(nextFontSize('normal')).toBe('large');
    expect(nextFontSize('large')).toBe('xlarge');
    expect(nextFontSize('xlarge')).toBe('normal');
  });

  it('applies and persists theme, font size and contrast', () => {
    localStorage.setItem('celebration_theme', 'dark');
    const { result } = renderHook(() => useDisplayPreferences());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('celebration_theme')).toBe('light');

    act(() => result.current.cycleFontSize());
    expect(result.current.fontSize).toBe('large');
    expect(document.documentElement.getAttribute('data-font-size')).toBe('large');

    act(() => result.current.toggleContrast());
    expect(result.current.highContrast).toBe(true);
    expect(document.documentElement.getAttribute('data-contrast')).toBe('high');
    expect(localStorage.getItem('celebration_contrast')).toBe('high');
  });

  it('survives unavailable localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useDisplayPreferences());
    expect(result.current.theme).toBe('light');
    expect(result.current.fontSize).toBe('normal');
    expect(result.current.highContrast).toBe(false);
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });
});

describe('usePlanDerivations', () => {
  it('derives budget, timeline, vendors, health score and countdown', () => {
    const plan = futurePlan();
    const { result } = renderHook(() => usePlanDerivations(plan));
    expect(result.current.budgetPlan).not.toBeNull();
    expect(result.current.timelinePlan?.phases.length).toBeGreaterThan(0);
    expect(result.current.vendorList.length).toBeGreaterThan(0);
    expect(result.current.healthScore).not.toBeNull();
    expect(result.current.daysUntilEvent).toBeGreaterThan(0);
  });

  it('degrades gracefully for a past date (no timeline, no health score)', () => {
    const plan = futurePlan({ eventDate: '2020-01-01' });
    const { result } = renderHook(() => usePlanDerivations(plan));
    expect(result.current.timelinePlan).toBeNull();
    expect(result.current.healthScore).toBeNull();
    expect(result.current.budgetPlan).not.toBeNull();
  });
});

describe('useChecklistProgress', () => {
  const vendors = [{ id: 'v1' }, { id: 'v2' }] as unknown as VendorItem[];
  const timeline = {
    phases: [{ tasks: [{ id: 't1' }, { id: 't2' }] }],
  } as unknown as TimelinePlan;

  it('counts checked vendors and timeline tasks', () => {
    localStorage.setItem('celebration_contracted_vendors', JSON.stringify({ v1: true }));
    localStorage.setItem(
      'celebration_completed_timeline_tasks',
      JSON.stringify({ t1: true, t2: true }),
    );
    const { result } = renderHook(() => useChecklistProgress(vendors, timeline));
    expect(result.current.completed).toBe(3);
    expect(result.current.total).toBe(4);
    expect(result.current.percent).toBe(75);
  });

  it('handles a missing timeline and corrupted storage without throwing', () => {
    localStorage.setItem('celebration_contracted_vendors', '{not json');
    const { result } = renderHook(() => useChecklistProgress(vendors, null));
    expect(result.current.completed).toBe(0);
    expect(result.current.total).toBe(1);
    expect(result.current.percent).toBe(0);
  });
});

describe('useEventForm', () => {
  it('toggles priorities and Indian wedding functions', () => {
    const plan = futurePlan({ priorities: ['food'] });
    const { result } = renderHook(() => useEventForm(plan, vi.fn()));
    act(() => result.current.togglePriority('decor'));
    expect(result.current.formData.priorities).toEqual(['food', 'decor']);
    act(() => result.current.togglePriority('food'));
    expect(result.current.formData.priorities).toEqual(['decor']);

    act(() => result.current.toggleIndianFunction('Haldi'));
    expect(result.current.formData.selectedFunctions).not.toContain('Haldi');
  });

  it('blocks invalid submissions with errors and submits valid ones sanitized', () => {
    const onSubmit = vi.fn();
    const plan = futurePlan({ budget: 10 });
    const { result } = renderHook(() => useEventForm(plan, onSubmit));
    const event = { preventDefault: vi.fn() } as never;

    act(() => result.current.handleSubmit(event));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.budget).toBeTruthy();

    act(() =>
      result.current.handleChange({ target: { name: 'budget', value: '500000' } } as never),
    );
    expect(result.current.errors.budget).toBeUndefined();
    act(() => result.current.handleSubmit(event));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('applies a preset with a future date and submits it', () => {
    const onSubmit = vi.fn();
    const plan = futurePlan();
    const { result } = renderHook(() => useEventForm(plan, onSubmit));
    act(() => result.current.applyPreset(futurePlan({ eventName: 'Preset Party' })));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].eventName).toBe('Preset Party');
    expect(new Date(onSubmit.mock.calls[0][0].eventDate).getTime()).toBeGreaterThan(Date.now());
  });

  it('keeps numeric fields numeric and the currency selectable', () => {
    const plan = futurePlan();
    const { result } = renderHook(() => useEventForm(plan, vi.fn()));
    act(() =>
      result.current.handleChange({ target: { name: 'guestCount', value: '42' } } as never),
    );
    expect(result.current.formData.guestCount).toBe(42);
    act(() => result.current.handleCurrencyChange('USD'));
    expect(result.current.formData.currency).toBe('USD');
  });
});

describe('day-of schedule', () => {
  it('returns a different schedule per event type, as independent copies', () => {
    const wedding = generateDayOfSchedule(futurePlan({ eventType: 'wedding' }));
    const community = generateDayOfSchedule(futurePlan({ eventType: 'community' }));
    const birthday = generateDayOfSchedule(futurePlan({ eventType: 'birthday' }));
    expect(wedding[0].activity).not.toBe(community[0].activity);
    expect(community[0].activity).not.toBe(birthday[0].activity);

    wedding[0].activity = 'mutated';
    expect(generateDayOfSchedule(futurePlan({ eventType: 'wedding' }))[0].activity).not.toBe(
      'mutated',
    );
  });
});

describe('AppHeader', () => {
  const baseProps = {
    theme: 'light' as const,
    fontSize: 'normal' as const,
    highContrast: false,
    onToggleTheme: vi.fn(),
    onCycleFontSize: vi.fn(),
    onToggleContrast: vi.fn(),
    onExportCalendar: vi.fn(),
    onPrint: vi.fn(),
  };

  it('exposes labeled, keyboard-operable controls that fire callbacks', () => {
    render(<AppHeader {...baseProps} />);
    expect(screen.getByRole('toolbar', { name: /accessibility/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    fireEvent.click(screen.getByRole('button', { name: /high contrast/i }));
    fireEvent.click(screen.getByRole('button', { name: /change text size/i }));
    fireEvent.click(screen.getByRole('button', { name: /export milestones/i }));
    fireEvent.click(screen.getByRole('button', { name: /print or save/i }));

    expect(baseProps.onToggleTheme).toHaveBeenCalled();
    expect(baseProps.onToggleContrast).toHaveBeenCalled();
    expect(baseProps.onCycleFontSize).toHaveBeenCalled();
    expect(baseProps.onExportCalendar).toHaveBeenCalled();
    expect(baseProps.onPrint).toHaveBeenCalled();
  });

  it('reports the pressed state of high contrast', () => {
    render(<AppHeader {...baseProps} highContrast theme="dark" />);
    expect(screen.getByRole('button', { name: /high contrast/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();
  });
});

describe('DashboardStrip', () => {
  it('shows singular/plural countdown and progress text', () => {
    const { rerender } = render(
      <DashboardStrip eventName="Gala" daysUntilEvent={1} completed={1} total={4} percent={25} />,
    );
    expect(screen.getByText(/1 Day to Gala/)).toBeInTheDocument();
    expect(screen.getByText('25% Prepared')).toBeInTheDocument();
    expect(screen.getByText(/1 of 4 milestones checked/)).toBeInTheDocument();

    rerender(
      <DashboardStrip eventName="Gala" daysUntilEvent={5} completed={1} total={4} percent={25} />,
    );
    expect(screen.getByText(/5 Days to Gala/)).toBeInTheDocument();
  });

  it('announces event day and 100% readiness', () => {
    render(
      <DashboardStrip eventName="Gala" daysUntilEvent={0} completed={3} total={3} percent={100} />,
    );
    expect(screen.getByText(/Celebration is Today/)).toBeInTheDocument();
    expect(screen.getByText(/100% Milestone Readiness/)).toBeInTheDocument();
  });
});