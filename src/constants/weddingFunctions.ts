/** Indian wedding ceremony presets. */

import { IndianWeddingFunction } from '../types.ts';

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
