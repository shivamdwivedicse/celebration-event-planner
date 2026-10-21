/** Base budget allocation percentages per event type (each table sums to 100). */

import { EventType, Priority } from '../types.ts';

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