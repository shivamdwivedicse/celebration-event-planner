/**
 * Standard day-of operational timelines with assigned roles, one per event type.
 */

import { DayOfScheduleItem, EventPlanInput } from '../../types.ts';

const WEDDING_SCHEDULE: DayOfScheduleItem[] = [
  {
    time: '08:00 AM',
    activity: 'Hair & Makeup Styling Begins',
    details: 'Bridal suite setup, breakfast pastries, and champagne toast.',
    assignedRole: 'Wedding Party / Stylist',
  },
  {
    time: '10:30 AM',
    activity: 'Vendor Load-In & Rental Delivery',
    details: 'Tables, chairs, sound equipment, and floral arches positioned.',
    assignedRole: 'Venue Coordinator',
  },
  {
    time: '01:00 PM',
    activity: 'Photographer Arrival & Detail Shots',
    details: 'Rings, dress, stationery, and wedding party first-look session.',
    assignedRole: 'Photographer',
  },
  {
    time: '03:30 PM',
    activity: 'Guest Arrival & Welcome Refreshments',
    details: 'Acoustic background music and signature cocktail station opens.',
    assignedRole: 'Ushers & Hospitality',
  },
  {
    time: '04:00 PM',
    activity: 'Official Ceremony Begins',
    details: 'Processional, vow exchange, unity ritual, and recessional fanfare.',
    assignedRole: 'Officiant & Planner',
  },
  {
    time: '05:00 PM',
    activity: 'Cocktail Hour & Golden Hour Portraits',
    details: 'Passed hors d’oeuvres while couple finishes sunset photo shoot.',
    assignedRole: 'Caterer & Photographer',
  },
  {
    time: '06:30 PM',
    activity: 'Grand Entrance & Dinner Service',
    details: 'Welcome toasts, plated/buffet entrees served with wine pairing.',
    assignedRole: 'MC & Banquet Captain',
  },
  {
    time: '08:00 PM',
    activity: 'Cake Cutting & First Dances',
    details: 'Formal dances followed by dance floor opening with high-energy set.',
    assignedRole: 'DJ & Couple',
  },
  {
    time: '10:30 PM',
    activity: 'Grand Sparkler Exit & Load-Out',
    details: 'Guest send-off followed by rental pack-down and security sign-off.',
    assignedRole: 'Event Planner & Crew',
  },
];

const COMMUNITY_SCHEDULE: DayOfScheduleItem[] = [
  {
    time: '07:30 AM',
    activity: 'Site Logistics & Safety Walkthrough',
    details: 'Inspect power outlets, signage, trash bins, and first-aid post.',
    assignedRole: 'Logistics Lead',
  },
  {
    time: '09:00 AM',
    activity: 'Stage & Audio PA Setup',
    details: 'Sound check for microphones, community speakers, and performers.',
    assignedRole: 'Audio Engineer',
  },
  {
    time: '10:00 AM',
    activity: 'Gates Open & Welcome Registration',
    details: 'Distribute event maps, name tags, and activity schedule.',
    assignedRole: 'Volunteer Team',
  },
  {
    time: '11:30 AM',
    activity: 'Community Keynote & Opening Ceremony',
    details: 'Remarks from community leaders and festival kickoff announcements.',
    assignedRole: 'Event Chair',
  },
  {
    time: '12:30 PM',
    activity: 'Lunch Stalls & Food Truck Rush',
    details: 'Monitor queue flow and ensure water refill stations are stocked.',
    assignedRole: 'Food Stalls Team',
  },
  {
    time: '02:30 PM',
    activity: 'Interactive Games, Workshops & Raffle',
    details: 'Kids activities, craft workshops, and community raffle drawing.',
    assignedRole: 'Activities Coordinator',
  },
  {
    time: '05:00 PM',
    activity: 'Closing Musical Showcase',
    details: 'Featured local band performance and appreciation acknowledgments.',
    assignedRole: 'Stage Manager',
  },
  {
    time: '06:30 PM',
    activity: 'Community Clean-Up & Site Restoration',
    details: 'Trash collection, recycling breakdown, and municipal hand-over.',
    assignedRole: 'All Volunteers',
  },
];

const BIRTHDAY_SCHEDULE: DayOfScheduleItem[] = [
  {
    time: '11:00 AM',
    activity: 'Decor Staging & Balloon Arches',
    details: 'Hang birthday banners, backdrop photo booth, and balloon pillars.',
    assignedRole: 'Host & Helpers',
  },
  {
    time: '01:00 PM',
    activity: 'Cake & Catering Delivery',
    details: 'Refrigerate birthday cake, set warming trays, and chill beverages.',
    assignedRole: 'Catering Lead',
  },
  {
    time: '02:00 PM',
    activity: 'Playlist & Lighting Ambience Ready',
    details: 'Turn on party lighting, connect music, and set up board games/props.',
    assignedRole: 'Host',
  },
  {
    time: '03:00 PM',
    activity: 'Guest Arrival & Welcome Drinks',
    details: 'Greet guests, receive gifts, and serve welcome mocktails/cocktails.',
    assignedRole: 'Host',
  },
  {
    time: '04:30 PM',
    activity: 'Party Games & Social Activities',
    details: 'Trivia, themed party games, or karaoke session.',
    assignedRole: 'Activity Leader',
  },
  {
    time: '06:00 PM',
    activity: 'Dinner Buffet / Food Station',
    details: 'Serve main meal options and social dining.',
    assignedRole: 'Food Coordinator',
  },
  {
    time: '07:15 PM',
    activity: 'Birthday Song & Cake Cutting',
    details: 'Candle lighting, birthday wishes, and cake distribution.',
    assignedRole: 'Host & Guests',
  },
  {
    time: '09:00 PM',
    activity: 'Favors Distribution & Farewell',
    details: 'Hand out gift bags and wrap up remaining leftovers.',
    assignedRole: 'Host',
  },
];

const SCHEDULES_BY_TYPE: Record<EventPlanInput['eventType'], DayOfScheduleItem[]> = {
  wedding: WEDDING_SCHEDULE,
  community: COMMUNITY_SCHEDULE,
  birthday: BIRTHDAY_SCHEDULE,
};

/** Returns a fresh copy of the day-of schedule for the event type (birthday by default). */
export function generateDayOfSchedule(input: EventPlanInput): DayOfScheduleItem[] {
  const schedule = SCHEDULES_BY_TYPE[input.eventType] ?? BIRTHDAY_SCHEDULE;
  return schedule.map((item) => ({ ...item }));
}