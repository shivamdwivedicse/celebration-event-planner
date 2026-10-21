/** Post-event wrap-up tasks. */

import { EventPlanInput, TimelineTask } from '../../types.ts';

/**
 * Post-event wrap-up tasks.
 */
export function generatePostEventTasks(input: EventPlanInput): TimelineTask[] {
  return [
    {
      id: 'post-rentals-return',
      title: 'Return Rented Equipment & Linens',
      description:
        'Check off itemized rental inventory, inspect for damage, and return containers.',
      category: 'Rentals',
      timeframe: 'Day +1 to +2 Post-Event',
      weekOffset: 1,
      isPriority: true,
    },
    {
      id: 'post-vendor-reconcile',
      title: 'Disburse Final Vendor Gratuities & Settle Invoices',
      description: `Reconcile final expenditures against the $${input.budget.toLocaleString()} plan and archive receipts.`,
      category: 'Budget',
      timeframe: 'Week +1 Post-Event',
      weekOffset: 1,
      isPriority: true,
    },
    {
      id: 'post-photos-share',
      title: 'Download & Share High-Resolution Photo Gallery',
      description: 'Send thank-you message to guests with access link to shared photo album.',
      category: 'Memories',
      timeframe: 'Weeks +2 to +3 Post-Event',
      weekOffset: 2,
      isPriority: false,
    },
    {
      id: 'post-thank-you',
      title: 'Send Handwritten or Digital Thank You Notes',
      description: `Acknowledge thoughtful gifts and attendance for all ${input.guestCount} attendees.`,
      category: 'Gratitude',
      timeframe: 'Weeks +2 to +4 Post-Event',
      weekOffset: 3,
      isPriority: false,
    },
  ];
}
