/**
 * Constants, budget allocation split tables, validation thresholds,
 * currency benchmarks, and limits for Celebration & Event Planner.
 */

import { CurrencyCode, EventType, IndianWeddingFunction, Priority } from './types.ts';

export const SYSTEM_LIMITS = {
  MIN_BUDGET: 50,
  MAX_BUDGET: 10_000_000,
  MIN_GUESTS: 1,
  MAX_GUESTS: 10_000,
  MAX_NAME_LENGTH: 120,
  MAX_NOTES_LENGTH: 500,
  MAX_CHAT_INPUT_LENGTH: 400,
  DEFAULT_CONTINGENCY_PERCENT: 8,
  MIN_CONTINGENCY_PERCENT: 5,
  MAX_CONTINGENCY_PERCENT: 12,
  AI_REQUEST_TIMEOUT_MS: 9000,
  AI_MAX_RETRIES: 1,
  LRU_CACHE_MAX_ENTRIES: 50,
} as const;

export interface CategoryDefinition {
  id: string;
  name: string;
  defaultPercentage: number;
  description: string;
  color: string;
  priorityKey?: Priority;
}

export const BASE_BUDGET_SPLITS: Record<EventType, CategoryDefinition[]> = {
  wedding: [
    {
      id: 'venue',
      name: 'Venue & Rentals',
      defaultPercentage: 28,
      description: 'Site rental fee, mandap/stage, tables, lighting, and setup',
      color: '#4f46e5',
      priorityKey: 'venue',
    },
    {
      id: 'catering',
      name: 'Catering & Bar Service',
      defaultPercentage: 30,
      description: 'Passed appetizers, main feast buffet/thali, desserts, and beverages',
      color: '#059669',
      priorityKey: 'food',
    },
    {
      id: 'photo',
      name: 'Photography & Video',
      defaultPercentage: 12,
      description: 'Candid photographer, cinematic video, drone, and high-res album',
      color: '#0891b2',
      priorityKey: 'photography',
    },
    {
      id: 'entertainment',
      name: 'Music & Entertainment',
      defaultPercentage: 8,
      description: 'Live band, DJ, dhol players, sound engineering, and party MC',
      color: '#d97706',
      priorityKey: 'entertainment',
    },
    {
      id: 'decor',
      name: 'Floral & Decor',
      defaultPercentage: 8,
      description: 'Marigold/rose floral arches, ceremony canopy, centerpieces, and lighting',
      color: '#db2777',
      priorityKey: 'decor',
    },
    {
      id: 'attire',
      name: 'Attire & Styling',
      defaultPercentage: 5,
      description: 'Ceremonial wardrobe, jewelry, makeup artists, and hair styling',
      color: '#7c3aed',
    },
    {
      id: 'invitations',
      name: 'Stationery & Favors',
      defaultPercentage: 2,
      description: 'Invitations, digital cards, sweet gift boxes, and guest return favors',
      color: '#65a30d',
      priorityKey: 'invitations',
    },
    {
      id: 'contingency',
      name: 'Contingency Reserve',
      defaultPercentage: 7,
      description: 'Buffer for last-minute guests, weather contingencies, or overtime',
      color: '#64748b',
    },
  ],
  birthday: [
    {
      id: 'venue',
      name: 'Venue / Space Rental',
      defaultPercentage: 20,
      description: 'Private room, event hall, park pavilion, or game venue',
      color: '#4f46e5',
      priorityKey: 'venue',
    },
    {
      id: 'catering',
      name: 'Food, Drinks & Birthday Cake',
      defaultPercentage: 35,
      description: 'Buffet or dining feast, custom theme cake, snacks, and drinks',
      color: '#059669',
      priorityKey: 'food',
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Games',
      defaultPercentage: 15,
      description: 'DJ, game host, photo booth, magic show, or interactive activities',
      color: '#d97706',
      priorityKey: 'entertainment',
    },
    {
      id: 'decor',
      name: 'Theme Decor & Balloons',
      defaultPercentage: 12,
      description: 'Balloon arches, backdrop, thematic tableware, and banners',
      color: '#db2777',
      priorityKey: 'decor',
    },
    {
      id: 'photo',
      name: 'Photography & Keepsakes',
      defaultPercentage: 6,
      description: 'Photographer or instant photo printing for commemorative memories',
      color: '#0891b2',
      priorityKey: 'photography',
    },
    {
      id: 'invitations',
      name: 'Invites & Party Favors',
      defaultPercentage: 4,
      description: 'Digital or printed invitations and thoughtful take-home gift bags',
      color: '#65a30d',
      priorityKey: 'invitations',
    },
    {
      id: 'contingency',
      name: 'Contingency Reserve',
      defaultPercentage: 8,
      description: 'Safety cushion for extra attendees or unexpected incidental expenses',
      color: '#64748b',
    },
  ],
  community: [
    {
      id: 'venue',
      name: 'Venue, Permits & Logistics',
      defaultPercentage: 25,
      description: 'Public park or ground permits, police NOC, sanitation, and power generators',
      color: '#4f46e5',
      priorityKey: 'venue',
    },
    {
      id: 'catering',
      name: 'Community Refreshments & Food',
      defaultPercentage: 30,
      description: 'Water refill stations, community langar/buffet, food stalls, or snacks',
      color: '#059669',
      priorityKey: 'food',
    },
    {
      id: 'entertainment',
      name: 'Sound, Stage & AV',
      defaultPercentage: 15,
      description:
        'PA audio system, stage canopy, microphones, and community cultural performances',
      color: '#d97706',
      priorityKey: 'entertainment',
    },
    {
      id: 'decor',
      name: 'Promotion, Banners & Signage',
      defaultPercentage: 10,
      description: 'Directional signage, welcome arch, posters, flyers, and volunteer badges',
      color: '#db2777',
      priorityKey: 'decor',
    },
    {
      id: 'activities',
      name: 'Workshops, Activities & Supplies',
      defaultPercentage: 12,
      description: 'Craft materials, recreational equipment, awards/prizes, and volunteer t-shirts',
      color: '#0891b2',
      priorityKey: 'invitations',
    },
    {
      id: 'contingency',
      name: 'Contingency & Emergency Care',
      defaultPercentage: 8,
      description: 'First aid kits, waste cleanup overtime, and unexpected municipal fees',
      color: '#64748b',
    },
  ],
};

// Benchmarks per guest to trigger warnings, multi-currency calibrated
export const PER_GUEST_BENCHMARKS_BY_CURRENCY: Record<
  CurrencyCode,
  Record<EventType, { criticalMin: number; standardMin: number; recommendedComfort: number }>
> = {
  INR: {
    wedding: { criticalMin: 1800, standardMin: 3500, recommendedComfort: 7000 },
    birthday: { criticalMin: 500, standardMin: 1200, recommendedComfort: 2500 },
    community: { criticalMin: 200, standardMin: 500, recommendedComfort: 1200 },
  },
  USD: {
    wedding: { criticalMin: 35, standardMin: 65, recommendedComfort: 120 },
    birthday: { criticalMin: 12, standardMin: 25, recommendedComfort: 50 },
    community: { criticalMin: 5, standardMin: 12, recommendedComfort: 25 },
  },
  EUR: {
    wedding: { criticalMin: 32, standardMin: 60, recommendedComfort: 110 },
    birthday: { criticalMin: 11, standardMin: 23, recommendedComfort: 48 },
    community: { criticalMin: 4.5, standardMin: 11, recommendedComfort: 23 },
  },
};

// Backward compatible default benchmarks (USD-based)
export const PER_GUEST_BENCHMARKS = PER_GUEST_BENCHMARKS_BY_CURRENCY.USD;

/**
 * Formats monetary amounts using Intl.NumberFormat according to the selected currency.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'INR',
  options?: { maximumFractionDigits?: number },
): string {
  const localeMap: Record<CurrencyCode, string> = {
    INR: 'en-IN',
    USD: 'en-US',
    EUR: 'de-DE',
  };

  const locale = localeMap[currency] || 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(amount);
}

/**
 * Returns symbol for currency code.
 */
export function getCurrencySymbol(currency: CurrencyCode = 'INR'): string {
  const symbols: Record<CurrencyCode, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || '₹';
}

/**
 * Indian wedding ceremonies presets and details.
 */
export const INDIAN_WEDDING_FUNCTIONS: {
  id: IndianWeddingFunction;
  name: string;
  tagline: string;
  recommendedTimeframe: string;
  typicalDurationHours: number;
  ritualFocus: string;
}[] = [
  {
    id: 'Haldi',
    name: 'Haldi Ceremony',
    tagline: 'Auspicious yellow floral & turmeric blessing',
    recommendedTimeframe: 'Morning (Day 1)',
    typicalDurationHours: 3,
    ritualFocus: 'Turmeric paste application, marigold floral decor, dhol & yellow theme attire',
  },
  {
    id: 'Mehendi',
    name: 'Mehendi Afternoon',
    tagline: 'Artisan henna design, folk songs & vibrant colors',
    recommendedTimeframe: 'Afternoon (Day 1)',
    typicalDurationHours: 4,
    ritualFocus:
      'Professional henna artists for bridal party, colorful cushions, live chaat stalls & bangles',
  },
  {
    id: 'Sangeet',
    name: 'Sangeet Night',
    tagline: 'High-energy musical dance gala & family performances',
    recommendedTimeframe: 'Evening (Day 1)',
    typicalDurationHours: 5,
    ritualFocus: 'Choreographed family dances, stage lighting, DJ, cocktail bar & lavish buffet',
  },
  {
    id: 'Wedding',
    name: 'Main Wedding (Varmala & Pheras)',
    tagline: 'Sacred vows, Baraat procession & sacred fire rituals',
    recommendedTimeframe: 'Day 2 (Auspicious Mahurat)',
    typicalDurationHours: 6,
    ritualFocus:
      'Grand Baraat with brass band, Varmala stage, traditional Vedic Mandap & sacred 7 Pheras',
  },
  {
    id: 'Reception',
    name: 'Grand Wedding Reception',
    tagline: 'Formal celebratory banquet & guest greetings',
    recommendedTimeframe: 'Evening (Day 2 or Day 3)',
    typicalDurationHours: 4,
    ritualFocus: 'Stage photo-op, gourmet dinner feast, formal speeches & couple first dance',
  },
];

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
