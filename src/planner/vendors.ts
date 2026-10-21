/**
 * Vendor checklist generator for celebrations and community gatherings.
 * Determines booking lead times, priority, budget shares, suggested interview questions,
 * and dynamically calculates overdue flags against remaining planning weeks.
 */

import { EventPlanInput, VendorItem } from '../types.ts';
import { calculateDaysRemaining } from './timeline.ts';

interface VendorTemplate {
  id: string;
  category: string;
  title: string;
  leadTimeWeeks: number;
  priority: 'high' | 'medium' | 'low';
  budgetSharePercent: number;
  suggestedQuestions: string[];
  applicableEventTypes?: ('wedding' | 'birthday' | 'community')[];
  applicableVenues?: ('indoor' | 'outdoor' | 'home')[];
}

const VENDOR_TEMPLATES: VendorTemplate[] = [
  // Wedding specific
  {
    id: 'vendor-wedding-venue',
    category: 'Venue & Facilities',
    title: 'Reception & Ceremony Venue Coordinator',
    leadTimeWeeks: 16,
    priority: 'high',
    budgetSharePercent: 28,
    suggestedQuestions: [
      'What is the curfew for loud music and amplified sound?',
      'Are we locked into an exclusive catering list, or can we bring outside vendors?',
      'What rain/weather backup rooms are guaranteed in writing?',
    ],
    applicableEventTypes: ['wedding'],
    applicableVenues: ['indoor', 'outdoor'],
  },
  {
    id: 'vendor-wedding-caterer',
    category: 'Catering & Dining',
    title: 'Full-Service Caterer & Bar Staff',
    leadTimeWeeks: 14,
    priority: 'high',
    budgetSharePercent: 30,
    suggestedQuestions: [
      'Are tableware, glassware, and linen rentals bundled or billed separately?',
      'How do you accommodate severe allergies and vegan/halal/kosher requests?',
      'What is your staff-to-guest ratio on the event floor?',
    ],
    applicableEventTypes: ['wedding'],
  },
  {
    id: 'vendor-photo-video',
    category: 'Media & Memories',
    title: 'Lead Photographer & Videographer',
    leadTimeWeeks: 12,
    priority: 'high',
    budgetSharePercent: 12,
    suggestedQuestions: [
      'Have you photographed at our chosen venue or lighting environment before?',
      'What is the turnaround time for the teaser gallery and full album?',
      'Do you carry backup camera bodies and dual SD-card slot backup?',
    ],
    applicableEventTypes: ['wedding', 'birthday'],
  },
  {
    id: 'vendor-dj-music',
    category: 'Entertainment',
    title: 'Professional DJ, MC & Sound Engineer',
    leadTimeWeeks: 8,
    priority: 'medium',
    budgetSharePercent: 8,
    suggestedQuestions: [
      'Do you provide wireless lapel microphones for ceremony/speeches?',
      'How do you handle guest song requests during the dance floor?',
      'Do you have a backup audio system on-site in case of hardware glitch?',
    ],
    applicableEventTypes: ['wedding', 'birthday', 'community'],
  },
  {
    id: 'vendor-florist-decor',
    category: 'Floral & Styling',
    title: 'Artisan Florist & Event Designer',
    leadTimeWeeks: 10,
    priority: 'medium',
    budgetSharePercent: 8,
    suggestedQuestions: [
      'Can flowers from the ceremony be repurposed for the dinner reception?',
      'Which in-season blooms best match our aesthetic and budget?',
      'Do you handle late-night teardown and floral donation?',
    ],
    applicableEventTypes: ['wedding'],
  },
  {
    id: 'vendor-wedding-officiant',
    category: 'Ceremony',
    title: 'Licensed Officiant / Celebrant',
    leadTimeWeeks: 8,
    priority: 'high',
    budgetSharePercent: 2,
    suggestedQuestions: [
      'Do we have full control over custom vows and ceremony readings?',
      'Will you handle filing the legal marriage certificate with the county clerk?',
      'Do you attend and run the ceremony rehearsal?',
    ],
    applicableEventTypes: ['wedding'],
  },

  // Birthday specific
  {
    id: 'vendor-birthday-space',
    category: 'Venue & Space',
    title: 'Party Space / Private Dining Room',
    leadTimeWeeks: 6,
    priority: 'high',
    budgetSharePercent: 20,
    suggestedQuestions: [
      'What time can we arrive early for balloon and banner setup?',
      'Are glitter, confetti, or sparklers allowed on premises?',
      'What is the cancellation or reschedule policy?',
    ],
    applicableEventTypes: ['birthday'],
    applicableVenues: ['indoor', 'outdoor'],
  },
  {
    id: 'vendor-birthday-food',
    category: 'Food & Cake',
    title: 'Custom Bakery & Party Catering',
    leadTimeWeeks: 4,
    priority: 'high',
    budgetSharePercent: 35,
    suggestedQuestions: [
      'Can you craft custom theme designs or dietary-safe cupcakes?',
      'Is delivery and temperature-controlled setup included?',
      'What are the minimum notice requirements for final guest count adjustments?',
    ],
    applicableEventTypes: ['birthday'],
  },
  {
    id: 'vendor-birthday-entertainment',
    category: 'Entertainment',
    title: 'Party Entertainer / Interactive Host / Photo Booth',
    leadTimeWeeks: 4,
    priority: 'medium',
    budgetSharePercent: 15,
    suggestedQuestions: [
      'What age group is your interactive show or game set best geared for?',
      'Do you bring all props, costumes, and sound gear?',
      'Does the photo booth include instant digital sharing via SMS/QR code?',
    ],
    applicableEventTypes: ['birthday'],
  },

  // Community specific
  {
    id: 'vendor-community-permits',
    category: 'Permits & Municipal',
    title: 'City Parks & Public Safety Permitting Office',
    leadTimeWeeks: 10,
    priority: 'high',
    budgetSharePercent: 25,
    suggestedQuestions: [
      'Are noise permits required for our amplified sound hours?',
      'Does the city mandate dedicated police/EMS presence for our attendee count?',
      'What are the exact insurance liability rider amounts required?',
    ],
    applicableEventTypes: ['community'],
  },
  {
    id: 'vendor-community-foodtrucks',
    category: 'Refreshments',
    title: 'Local Food Trucks & Beverage Providers',
    leadTimeWeeks: 6,
    priority: 'high',
    budgetSharePercent: 30,
    suggestedQuestions: [
      'Can your truck power itself via onboard generator, or do you need a 220V hookup?',
      'How many attendees can your truck serve per hour to prevent bottlenecks?',
      'Do you supply trash and recycling bins around your service window?',
    ],
    applicableEventTypes: ['community'],
  },
  {
    id: 'vendor-community-av',
    category: 'Production',
    title: 'Sound Stage & Public Address (PA) Audio Crew',
    leadTimeWeeks: 6,
    priority: 'high',
    budgetSharePercent: 15,
    suggestedQuestions: [
      'Can your system clearly cover outdoor park ambient noise across 100 meters?',
      'Do you have rain covers and ground-fault interrupter power cables?',
      'Will an audio technician remain on-site throughout all speaker presentations?',
    ],
    applicableEventTypes: ['community'],
  },
  {
    id: 'vendor-sanitation-waste',
    category: 'Logistics',
    title: 'Sanitation & Portable Restroom Rentals',
    leadTimeWeeks: 4,
    priority: 'high',
    budgetSharePercent: 8,
    suggestedQuestions: [
      'How many units are recommended for our specific attendance and duration?',
      'Are ADA-accessible wheelchair units and hand-washing stations included?',
      'When is scheduled drop-off and final pump-out removal?',
    ],
    applicableEventTypes: ['community', 'wedding', 'birthday'],
    applicableVenues: ['outdoor'],
  },
  {
    id: 'vendor-tent-rentals',
    category: 'Infrastructure',
    title: 'Canopy Tent & Weather Shelter Supplier',
    leadTimeWeeks: 6,
    priority: 'medium',
    budgetSharePercent: 10,
    suggestedQuestions: [
      'Are water-barrel ballasts or ground stakes used for anchoring?',
      'Do the tents include sidewalls in case of lateral rain or wind?',
      'Does the rental include setup and teardown labor?',
    ],
    applicableVenues: ['outdoor'],
  },
];

/**
 * Generates an event-specific vendor checklist with dynamic overdue flags.
 */
export function generateVendorChecklist(
  input: EventPlanInput,
  referenceDate: Date = new Date(),
): VendorItem[] {
  const daysRemaining = calculateDaysRemaining(input.eventDate, referenceDate);
  const weeksRemaining = Math.max(0, Math.floor(daysRemaining / 7));

  // Filter templates matching this event and venue
  const matched = VENDOR_TEMPLATES.filter((v) => {
    if (v.applicableEventTypes && !v.applicableEventTypes.includes(input.eventType)) {
      return false;
    }
    if (v.applicableVenues && !v.applicableVenues.includes(input.venueType)) {
      return false;
    }
    return true;
  });

  return matched.map((v) => ({
    id: v.id,
    category: v.category,
    title: v.title,
    leadTimeWeeks: v.leadTimeWeeks,
    priority: v.priority,
    budgetSharePercent: v.budgetSharePercent,
    isOverdue: weeksRemaining < v.leadTimeWeeks,
    suggestedQuestions: v.suggestedQuestions,
  }));
}
