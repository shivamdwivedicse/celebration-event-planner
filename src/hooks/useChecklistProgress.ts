import { useEffect, useState } from 'react';
import type { VendorItem, TimelinePlan } from '../types.ts';

const VENDOR_KEY = 'celebration_contracted_vendors';
const TIMELINE_KEY = 'celebration_completed_timeline_tasks';

type CompletionMap = Record<string, boolean>;

/** Reads a saved id -> done map; returns an empty map on missing/invalid data. */
function readCompletionMap(key: string): CompletionMap {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

interface Progress {
  completed: number;
  total: number;
}

/** Counts contracted vendors; storage failures leave the counts unchanged. */
function countVendors(vendors: VendorItem[]): Progress {
  try {
    const done = readCompletionMap(VENDOR_KEY);
    return {
      total: vendors.length,
      completed: vendors.filter((vendor) => done[vendor.id]).length,
    };
  } catch {
    return { completed: 0, total: 0 };
  }
}

/** Counts completed timeline tasks across all phases. */
function countTimelineTasks(timeline: TimelinePlan | null): Progress {
  if (!timeline) return { completed: 0, total: 0 };
  try {
    const done = readCompletionMap(TIMELINE_KEY);
    let completed = 0;
    let total = 0;
    for (const phase of timeline.phases) {
      for (const task of phase.tasks) {
        total += 1;
        if (done[task.id]) completed += 1;
      }
    }
    return { completed, total };
  } catch {
    return { completed: 0, total: 0 };
  }
}

/**
 * Tracks how many vendor and timeline milestones are checked off.
 * Returns the counts plus a rounded completion percentage.
 */
export function useChecklistProgress(vendors: VendorItem[], timeline: TimelinePlan | null) {
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const vendorProgress = countVendors(vendors);
    const timelineProgress = countTimelineTasks(timeline);
    setCompleted(vendorProgress.completed + timelineProgress.completed);
    setTotal(Math.max(1, vendorProgress.total + timelineProgress.total));
  }, [vendors, timeline]);

  const percent = Math.round((completed / Math.max(1, total)) * 100);
  return { completed, total, percent };
}
