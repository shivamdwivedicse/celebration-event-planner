/** Quick-start event templates shown in the form. */

import { CurrencyCode, EventType, IndianWeddingFunction, Priority } from '../types.ts';

export const DEFAULT_PRESETS = [
  {
    label: '✨ Royal Indian Wedding (INR)',
    input: {
      eventType: 'wedding' as EventType,
      eventName: 'Ananya & Rohan Grand Wedding',
      guestCount: 250,
      budget: 1800000,
      venueType: 'indoor' as const,
      currency: 'INR' as CurrencyCode,
      selectedFunctions: [
        'Haldi',
        'Mehendi',
        'Sangeet',
        'Wedding',
        'Reception',
      ] as IndianWeddingFunction[],
      priorities: ['food', 'photography', 'decor'] as Priority[],
      notes:
        'Grand multi-day celebration with royal heritage decor, live dhol, and traditional multi-cuisine feast.',
    },
  },
  {
    label: '🎂 Milestone Birthday (INR)',
    input: {
      eventType: 'birthday' as EventType,
      eventName: "Kabir's 25th Milestone Birthday",
      guestCount: 45,
      budget: 85000,
      venueType: 'home' as const,
      currency: 'INR' as CurrencyCode,
      priorities: ['food', 'entertainment'] as Priority[],
      notes:
        'Cozy terrace celebration with artisanal street-food live counters, signature drinks, and acoustic tunes.',
    },
  },
  {
    label: '🌳 Community Mela & Festival (INR)',
    input: {
      eventType: 'community' as EventType,
      eventName: 'Vasundhara Neighborhood Diwali Mela',
      guestCount: 400,
      budget: 350000,
      venueType: 'outdoor' as const,
      currency: 'INR' as CurrencyCode,
      priorities: ['entertainment', 'decor', 'venue'] as Priority[],
      notes:
        'Open neighborhood mela with cultural dance stage, diya lighting, local handicraft stalls, and sweets.',
    },
  },
  {
    label: '💍 Classic Wedding (USD)',
    input: {
      eventType: 'wedding' as EventType,
      eventName: 'Sarah & Alex Wedding Celebration',
      guestCount: 100,
      budget: 25000,
      venueType: 'indoor' as const,
      currency: 'USD' as CurrencyCode,
      priorities: ['food', 'photography', 'venue'] as Priority[],
      notes:
        'Garden-terrace atmosphere with timeless golden-hour photography and farm-to-table dinner.',
    },
  },
];
