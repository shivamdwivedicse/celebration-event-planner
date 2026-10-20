/**
 * Deterministic date-based timeline planner.
 * Calculates week-by-week milestones counting backward from the target event date,
 * detects rush scenarios under 2 weeks with prioritized critical path tasks,
 * validates against past dates and leap years, and generates day-of & post-event schedules.
 */

import { DayOfScheduleItem, EventPlanInput, TimelinePhase, TimelinePlan, TimelineTask } from '../types.ts';

/**
 * Computes difference in calendar days between reference date and event date (UTC-normalized).
 */
export function calculateDaysRemaining(eventDateStr: string, referenceDate: Date = new Date()): number {
  const [year, month, day] = eventDateStr.split('-').map(Number);
  const eventUTC = Date.UTC(year, month - 1, day);
  const refUTC = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate()
  );

  const diffMs = eventUTC - refUTC;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates the full TimelinePlan based on event input and calendar math.
 */
export function generateTimelinePlan(input: EventPlanInput, referenceDate: Date = new Date()): TimelinePlan {
  const daysRemaining = calculateDaysRemaining(input.eventDate, referenceDate);

  if (daysRemaining <= 0) {
    throw new Error('Event date must be strictly in the future. Past dates cannot be scheduled.');
  }

  const totalWeeks = Math.max(0, Math.floor(daysRemaining / 7));
  const isRushPlan = totalWeeks < 2;

  let rushNotice: string | undefined;
  if (isRushPlan) {
    rushNotice = `Rush Plan Active: Celebration is only ${daysRemaining} day${
      daysRemaining === 1 ? '' : 's'
    } away! Routine timelines have been compressed into an accelerated critical path focusing on venue, food, and essentials.`;
  }

  const phases = isRushPlan
    ? generateRushPhases(input, daysRemaining)
    : generateStandardPhases(input, totalWeeks);

  const dayOfSchedule = generateDayOfSchedule(input);
  const postEventTasks = generatePostEventTasks(input);

  return {
    isRushPlan,
    totalWeeks,
    rushNotice,
    phases,
    dayOfSchedule,
    postEventTasks,
  };
}

/**
 * Standard week-by-week phases counting backward from the event.
 */
function generateStandardPhases(input: EventPlanInput, weeksRemaining: number): TimelinePhase[] {
  const phases: TimelinePhase[] = [];

  // Phase 1: Foundation (Early Milestone)
  const p1Tasks: TimelineTask[] = [
    {
      id: 'task-budget-confirm',
      title: 'Lock In Total Budget & Guest Ceiling',
      description: `Formalize target budget ($${input.budget.toLocaleString()}) and guest cap (${input.guestCount}).`,
      category: 'Budget',
      timeframe: `${Math.min(weeksRemaining, 16)}+ Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 16),
      isPriority: true,
    },
    {
      id: 'task-venue-book',
      title: input.venueType === 'home' ? 'Confirm Home Layout & Permits' : 'Tour & Reserve Venue Space',
      description:
        input.venueType === 'home'
          ? 'Map out backyard/living spaces, power outlets, and neighbor notifications.'
          : 'Sign contract, pay security deposit, and verify liability insurance requirements.',
      category: 'Venue',
      timeframe: `${Math.min(weeksRemaining, 16)} Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 16),
      isPriority: true,
    },
    {
      id: 'task-caterer-contact',
      title: 'Interview & Retain Primary Caterer',
      description: 'Request menu tastings, dietary alternatives, and service staff quotes.',
      category: 'Catering',
      timeframe: `${Math.min(weeksRemaining, 12)} Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 12),
      isPriority: true,
    },
  ];

  phases.push({
    phaseName: 'Phase 1: Foundation & Core Contracts',
    timeframe: `${Math.min(weeksRemaining, 16)}+ Weeks Before`,
    tasks: p1Tasks,
  });

  // Phase 2: Key Vendors & Design
  const p2Tasks: TimelineTask[] = [
    {
      id: 'task-photo-book',
      title: 'Contract Photographer / Videographer',
      description: 'Review portfolio galleries, shot lists, and turnaround timelines.',
      category: 'Media',
      timeframe: `${Math.min(weeksRemaining, 8)}-12 Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 8),
      isPriority: input.priorities.includes('photography'),
    },
    {
      id: 'task-music-book',
      title: 'Engage Live DJ or Audio Sound Engineer',
      description: 'Curate must-play playlist, do-not-play list, and audio equipment specs.',
      category: 'Music',
      timeframe: `${Math.min(weeksRemaining, 8)} Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 8),
      isPriority: input.priorities.includes('entertainment'),
    },
    {
      id: 'task-invitations-send',
      title: 'Distribute Official Invitations & RSVP Tracker',
      description: 'Send digital/print invitations with RSVP deadline set 3 weeks before the event.',
      category: 'Invites',
      timeframe: `${Math.min(weeksRemaining, 6)} Weeks Before`,
      weekOffset: -Math.min(weeksRemaining, 6),
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
function generateRushPhases(input: EventPlanInput, daysRemaining: number): TimelinePhase[] {
  return [
    {
      phaseName: '🚨 Immediate 48 Hours: Critical Securing',
      timeframe: 'Days 1-2',
      tasks: [
        {
          id: 'rush-venue',
          title: 'Immediate Venue & Space Lock',
          description: input.venueType === 'home'
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
          description: 'Contact local favorite restaurant for bulk tray drop-off rather than full plated service.',
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
          description: 'Bulk purchase ice, biodegradable tableware, beverage mixers, and festive banners.',
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

/**
 * Standard day-of operational timeline with assigned roles.
 */
function generateDayOfSchedule(input: EventPlanInput): DayOfScheduleItem[] {
  const isWedding = input.eventType === 'wedding';
  const isCommunity = input.eventType === 'community';

  if (isWedding) {
    return [
      { time: '08:00 AM', activity: 'Hair & Makeup Styling Begins', details: 'Bridal suite setup, breakfast pastries, and champagne toast.', assignedRole: 'Wedding Party / Stylist' },
      { time: '10:30 AM', activity: 'Vendor Load-In & Rental Delivery', details: 'Tables, chairs, sound equipment, and floral arches positioned.', assignedRole: 'Venue Coordinator' },
      { time: '01:00 PM', activity: 'Photographer Arrival & Detail Shots', details: 'Rings, dress, stationery, and wedding party first-look session.', assignedRole: 'Photographer' },
      { time: '03:30 PM', activity: 'Guest Arrival & Welcome Refreshments', details: 'Acoustic background music and signature cocktail station opens.', assignedRole: 'Ushers & Hospitality' },
      { time: '04:00 PM', activity: 'Official Ceremony Begins', details: 'Processional, vow exchange, unity ritual, and recessional fanfare.', assignedRole: 'Officiant & Planner' },
      { time: '05:00 PM', activity: 'Cocktail Hour & Golden Hour Portraits', details: 'Passed hors d’oeuvres while couple finishes sunset photo shoot.', assignedRole: 'Caterer & Photographer' },
      { time: '06:30 PM', activity: 'Grand Entrance & Dinner Service', details: 'Welcome toasts, plated/buffet entrees served with wine pairing.', assignedRole: 'MC & Banquet Captain' },
      { time: '08:00 PM', activity: 'Cake Cutting & First Dances', details: 'Formal dances followed by dance floor opening with high-energy set.', assignedRole: 'DJ & Couple' },
      { time: '10:30 PM', activity: 'Grand Sparkler Exit & Load-Out', details: 'Guest send-off followed by rental pack-down and security sign-off.', assignedRole: 'Event Planner & Crew' },
    ];
  }

  if (isCommunity) {
    return [
      { time: '07:30 AM', activity: 'Site Logistics & Safety Walkthrough', details: 'Inspect power outlets, signage, trash bins, and first-aid post.', assignedRole: 'Logistics Lead' },
      { time: '09:00 AM', activity: 'Stage & Audio PA Setup', details: 'Sound check for microphones, community speakers, and performers.', assignedRole: 'Audio Engineer' },
      { time: '10:00 AM', activity: 'Gates Open & Welcome Registration', details: 'Distribute event maps, name tags, and activity schedule.', assignedRole: 'Volunteer Team' },
      { time: '11:30 AM', activity: 'Community Keynote & Opening Ceremony', details: 'Remarks from community leaders and festival kickoff announcements.', assignedRole: 'Event Chair' },
      { time: '12:30 PM', activity: 'Lunch Stalls & Food Truck Rush', details: 'Monitor queue flow and ensure water refill stations are stocked.', assignedRole: 'Food Stalls Team' },
      { time: '02:30 PM', activity: 'Interactive Games, Workshops & Raffle', details: 'Kids activities, craft workshops, and community raffle drawing.', assignedRole: 'Activities Coordinator' },
      { time: '05:00 PM', activity: 'Closing Musical Showcase', details: 'Featured local band performance and appreciation acknowledgments.', assignedRole: 'Stage Manager' },
      { time: '06:30 PM', activity: 'Community Clean-Up & Site Restoration', details: 'Trash collection, recycling breakdown, and municipal hand-over.', assignedRole: 'All Volunteers' },
    ];
  }

  // Birthday celebration default
  return [
    { time: '11:00 AM', activity: 'Decor Staging & Balloon Arches', details: 'Hang birthday banners, backdrop photo booth, and balloon pillars.', assignedRole: 'Host & Helpers' },
    { time: '01:00 PM', activity: 'Cake & Catering Delivery', details: 'Refrigerate birthday cake, set warming trays, and chill beverages.', assignedRole: 'Catering Lead' },
    { time: '02:00 PM', activity: 'Playlist & Lighting Ambience Ready', details: 'Turn on party lighting, connect music, and set up board games/props.', assignedRole: 'Host' },
    { time: '03:00 PM', activity: 'Guest Arrival & Welcome Drinks', details: 'Greet guests, receive gifts, and serve welcome mocktails/cocktails.', assignedRole: 'Host' },
    { time: '04:30 PM', activity: 'Party Games & Social Activities', details: 'Trivia, themed party games, or karaoke session.', assignedRole: 'Activity Leader' },
    { time: '06:00 PM', activity: 'Dinner Buffet / Food Station', details: 'Serve main meal options and social dining.', assignedRole: 'Food Coordinator' },
    { time: '07:15 PM', activity: 'Birthday Song & Cake Cutting', details: 'Candle lighting, birthday wishes, and cake distribution.', assignedRole: 'Host & Guests' },
    { time: '09:00 PM', activity: 'Favors Distribution & Farewell', details: 'Hand out gift bags and wrap up remaining leftovers.', assignedRole: 'Host' },
  ];
}

/**
 * Post-event wrap-up tasks.
 */
function generatePostEventTasks(input: EventPlanInput): TimelineTask[] {
  return [
    {
      id: 'post-rentals-return',
      title: 'Return Rented Equipment & Linens',
      description: 'Check off itemized rental inventory, inspect for damage, and return containers.',
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
