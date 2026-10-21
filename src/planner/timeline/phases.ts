/**
 * Phase builders for the timeline: the standard week-by-week plan and the
 * compressed rush plan used when the event is under two weeks away.
 */

import { EventPlanInput, TimelinePhase, TimelineTask } from '../../types.ts';

/**
 * Standard week-by-week phases counting backward from the event.
 */
export function generateStandardPhases(
  input: EventPlanInput,
  weeksRemaining: number,
): TimelinePhase[] {
  const phases: TimelinePhase[] = [];
  /** Caps a lead time at the number of weeks actually available. */
  const cap = (maxWeeks: number): number => Math.min(weeksRemaining, maxWeeks);

  // Phase 1: Foundation (Early Milestone)
  const p1Tasks: TimelineTask[] = [
    {
      id: 'task-budget-confirm',
      title: 'Lock In Total Budget & Guest Ceiling',
      description: `Formalize target budget ($${input.budget.toLocaleString()}) and guest cap (${input.guestCount}).`,
      category: 'Budget',
      timeframe: `${cap(16)}+ Weeks Before`,
      weekOffset: -cap(16),
      isPriority: true,
    },
    {
      id: 'task-venue-book',
      title:
        input.venueType === 'home' ? 'Confirm Home Layout & Permits' : 'Tour & Reserve Venue Space',
      description:
        input.venueType === 'home'
          ? 'Map out backyard/living spaces, power outlets, and neighbor notifications.'
          : 'Sign contract, pay security deposit, and verify liability insurance requirements.',
      category: 'Venue',
      timeframe: `${cap(16)} Weeks Before`,
      weekOffset: -cap(16),
      isPriority: true,
    },
    {
      id: 'task-caterer-contact',
      title: 'Interview & Retain Primary Caterer',
      description: 'Request menu tastings, dietary alternatives, and service staff quotes.',
      category: 'Catering',
      timeframe: `${cap(12)} Weeks Before`,
      weekOffset: -cap(12),
      isPriority: true,
    },
  ];

  phases.push({
    phaseName: 'Phase 1: Foundation & Core Contracts',
    timeframe: `${cap(16)}+ Weeks Before`,
    tasks: p1Tasks,
  });

  // Phase 2: Key Vendors & Design
  const p2Tasks: TimelineTask[] = [
    {
      id: 'task-photo-book',
      title: 'Contract Photographer / Videographer',
      description: 'Review portfolio galleries, shot lists, and turnaround timelines.',
      category: 'Media',
      timeframe: `${cap(8)}-12 Weeks Before`,
      weekOffset: -cap(8),
      isPriority: input.priorities.includes('photography'),
    },
    {
      id: 'task-music-book',
      title: 'Engage Live DJ or Audio Sound Engineer',
      description: 'Curate must-play playlist, do-not-play list, and audio equipment specs.',
      category: 'Music',
      timeframe: `${cap(8)} Weeks Before`,
      weekOffset: -cap(8),
      isPriority: input.priorities.includes('entertainment'),
    },
    {
      id: 'task-invitations-send',
      title: 'Distribute Official Invitations & RSVP Tracker',
      description:
        'Send digital/print invitations with RSVP deadline set 3 weeks before the event.',
      category: 'Invites',
      timeframe: `${cap(6)} Weeks Before`,
      weekOffset: -cap(6),
      isPriority: true,
    },
  ];

  phases.push({
    phaseName: 'Phase 2: Vendors, Invites & Styling',
    timeframe: '6-12 Weeks Before',
    tasks: p2Tasks,
  });

  // Phase 3: Final Logistics & Confirmations
  const p3Tasks: TimelineTask[] = [
    {
      id: 'task-headcount-finalize',
      title: 'Finalize RSVP Headcount & Dietary Roster',
      description: 'Submit guaranteed meal numbers and allergy restrictions to caterer.',
      category: 'Logistics',
      timeframe: '2-3 Weeks Before',
      weekOffset: -2,
      isPriority: true,
    },
    {
      id: 'task-timeline-review',
      title: 'Review Day-Of Schedule with All Vendors',
      description: 'Distribute arrival load-in times, contact sheet, and parking directions.',
      category: 'Coordination',
      timeframe: '1-2 Weeks Before',
      weekOffset: -1,
      isPriority: true,
    },
    {
      id: 'task-decor-staging',
      title: 'Stage Centerpieces, Signage & Welcome Favors',
      description: 'Group decorative items in labeled bins ready for quick transit.',
      category: 'Decor',
      timeframe: 'Final Week Before',
      weekOffset: -1,
      isPriority: false,
    },
  ];

  phases.push({
    phaseName: 'Phase 3: Final Logistics & Countdown',
    timeframe: '1-3 Weeks Before',
    tasks: p3Tasks,
  });

  return phases;
}

/**
 * Expedited rush phases when event is less than 14 days away.
 */
export function generateRushPhases(input: EventPlanInput, daysRemaining: number): TimelinePhase[] {
  return [
    {
      phaseName: '🚨 Immediate 48 Hours: Critical Securing',
      timeframe: 'Days 1-2',
      tasks: [
        {
          id: 'rush-venue',
          title: 'Immediate Venue & Space Lock',
          description:
            input.venueType === 'home'
              ? 'Clear furniture, prep home spaces, and secure party tent/umbrellas.'
              : 'Confirm emergency rental availability or expedited private room booking.',
          category: 'Venue',
          timeframe: 'Immediate',
          weekOffset: 0,
          isPriority: true,
        },
        {
          id: 'rush-catering',
          title: 'Order Express Drop-Off Catering or Buffet',
          description:
            'Contact local favorite restaurant for bulk tray drop-off rather than full plated service.',
          category: 'Catering',
          timeframe: 'Immediate',
          weekOffset: 0,
          isPriority: true,
        },
        {
          id: 'rush-invites',
          title: 'Send Instant Digital Invites via SMS / Group Link',
          description: `Send direct RSVP links to ${input.guestCount} guests with firm 48-hour response window.`,
          category: 'Invites',
          timeframe: 'Immediate',
          weekOffset: 0,
          isPriority: true,
        },
      ],
    },
    {
      phaseName: '⚡ Days 3 to Event: Execution & Supplies',
      timeframe: `Days 3-${daysRemaining}`,
      tasks: [
        {
          id: 'rush-supplies',
          title: 'Procure Tableware, Beverages & Party Essentials',
          description:
            'Bulk purchase ice, biodegradable tableware, beverage mixers, and festive banners.',
          category: 'Supplies',
          timeframe: '3 Days Before',
          weekOffset: 0,
          isPriority: true,
        },
        {
          id: 'rush-audio',
          title: 'Assemble Portable Speaker & Curated Playlist',
          description: 'Charge Bluetooth PA speaker and download offline music playlists.',
          category: 'Music',
          timeframe: '2 Days Before',
          weekOffset: 0,
          isPriority: false,
        },
        {
          id: 'rush-final-check',
          title: 'Final Headcount & Emergency Kit Staging',
          description: 'Pack scissors, tape, extension cords, first aid, and printed schedule.',
          category: 'Logistics',
          timeframe: '1 Day Before',
          weekOffset: 0,
          isPriority: true,
        },
      ],
    },
  ];
}