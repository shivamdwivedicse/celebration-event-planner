/**
 * Curated offline ideas engine.
 * Ensures the app operates seamlessly with zero dependencies on API keys,
 * network connectivity, or LLM uptime, providing rich, domain-specific concepts.
 */

import { EventPlanInput, IdeasResult } from '../types.ts';

/**
 * Returns tailored theme ideas, interactive activities, and curated menu concepts.
 */
export function getCuratedFallbackIdeas(input: EventPlanInput): IdeasResult {
  const { eventType, venueType } = input;

  if (eventType === 'wedding') {
    return {
      source: 'fallback',
      themeIdeas: [
        {
          title:
            venueType === 'outdoor' ? 'Enchanted Botanical Garden' : 'Modern Candlelit Elegance',
          description:
            'A warm, romantic celebration highlighted by layered textural florals, warm tungsten fairy lights, and timeless neutral accents.',
          decorNotes:
            'Eucalyptus runners, low pillar candles inside hurricane glass, brass table numbers, and ivory chiffon drapery.',
          colorPalette: ['#1e293b', '#64748b', '#cbd5e1', '#f8fafc', '#d97706'],
        },
        {
          title: 'Golden Sunset Terrace Romance',
          description:
            'Warm terracotta and champagne tones designed to capture natural golden-hour luminescence with effortless sophistication.',
          decorNotes:
            'Terracotta pottery bud vases, pampas grass accents, raw silk napkins, and ambient amber up-lighting.',
          colorPalette: ['#9a3412', '#ea580c', '#fdba74', '#fff7ed', '#78350f'],
        },
        {
          title: 'Artisan Winery & Vineyard Glow',
          description:
            'Rustic charm elevated with polished timber, deep olive greenery, and curated regional wine pairings.',
          decorNotes:
            'Reclaimed oak barrel cocktail stations, olive branch garlands, slate stone signage, and bistro festoon string lights.',
          colorPalette: ['#3f6212', '#65a30d', '#ecfccb', '#713f12', '#fef08a'],
        },
      ],
      activities: [
        {
          title: 'Audio Guestbook Vintage Telephone',
          description:
            'A retro rotary phone where guests lift the receiver to record heartfelt audio messages, laughter, and advice.',
          targetGroup: 'All guests',
          durationMinutes: 180,
        },
        {
          title: 'Golden Hour Polaroid Station',
          description:
            'Guests snap immediate candid polaroid portraits to paste into a leather-bound keepsake scrapbook with personalized notes.',
          targetGroup: 'Social mingling',
          durationMinutes: 120,
        },
        {
          title: 'Late-Night Specialty Food Surprise',
          description:
            'Passing warm slider sliders, mini churros, or a wood-fired pretzel station at 10 PM to re-energize the dance floor.',
          targetGroup: 'Party crowd',
          durationMinutes: 45,
        },
      ],
      menuSuggestions: [
        {
          style: 'Farm-to-Table Seasonal Plated Dinner',
          items: [
            'Heirloom burrata with charred peaches, aged balsamic, and microbasil',
            'Herb-crusted pan-seared sea bass over sweet corn risotto',
            'Braised prime short rib with truffle pomme puree and glazed baby carrots',
            'Lemon elderflower tiered sponge cake with fresh raspberry reduction',
          ],
          notes: 'Accommodates gluten-free diners naturally with elegant seasonal produce.',
        },
        {
          style: 'Artisan Tapas & Interactive Food Stations',
          items: [
            'Spanish jamón ibérico and manchego carving board with marcona almonds',
            'Wild mushroom and goat cheese tartlets with thyme honey',
            'Mini brioche lobster rolls with citrus herb aioli',
            'Deconstructed dark chocolate ganache tarts with sea salt',
          ],
          notes: 'Encourages dynamic room flow and conversational mingling.',
        },
      ],
    };
  }

  if (eventType === 'birthday') {
    return {
      source: 'fallback',
      themeIdeas: [
        {
          title: venueType === 'home' ? 'Cozy Backyard Bistro & Beats' : 'Retro Neon Arcade Glow',
          description:
            'An energetic, fun celebration celebrating milestone memories with vibrant color bursts and upbeat nostalgia.',
          decorNotes:
            'Custom neon name LED sign, balloon garland arches in metallic chrome, and curated lounge seating.',
          colorPalette: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        },
        {
          title: 'Velvet Speakeasy Lounge',
          description:
            'Intimate, mood-lit cocktail experience featuring tailored mixology and jazz-hop acoustics.',
          decorNotes:
            'Dark emerald tablecloths, vintage crystal glassware, brass bar carts, and soft candlelight.',
          colorPalette: ['#064e3b', '#047857', '#d97706', '#18181b', '#f4f4f5'],
        },
        {
          title: 'Boho Sunset Picnic & Garden Party',
          description:
            'Relaxed, aesthetic floor seating with woven rugs, plush floor cushions, and artisanal charcuterie boards.',
          decorNotes:
            'Low reclaimed wood tables, wicker lanterns, dried floral bouquets, and macrame accents.',
          colorPalette: ['#d97706', '#b45309', '#fef3c7', '#78350f', '#84cc16'],
        },
      ],
      activities: [
        {
          title: 'Custom Milestone Trivia Challenge',
          description:
            'Interactive mobile trivia quiz featuring funny questions about the birthday host, childhood photos, and shared memories.',
          targetGroup: 'All guests',
          durationMinutes: 30,
        },
        {
          title: 'Signature DIY Mocktail / Cocktail Bar',
          description:
            'Guests concoct custom drinks with herb syrups (rosemary, lavender), fresh purees, garnishes, and custom printed stirrers.',
          targetGroup: 'Adults & Teens',
          durationMinutes: 60,
        },
        {
          title: 'Instant 360 Video Booth',
          description:
            'Guests hop onto an elevated spinning camera platform for slow-motion music video clips ready for immediate phone sharing.',
          targetGroup: 'High energy attendees',
          durationMinutes: 90,
        },
      ],
      menuSuggestions: [
        {
          style: 'Street-Food Festival Gourmet Buffet',
          items: [
            'Baja fish and slow-roasted carnitas tacos on warm hand-pressed tortillas',
            'Fresh guacamole, roasted corn esquites, and fire-roasted salsa bar',
            'Crispy empanadas with chimichurri dipping sauces',
            'Artisan mini churro bites filled with dulce de leche and chocolate',
          ],
          notes: 'Fast, casual, high satisfaction with straightforward dairy-free options.',
        },
        {
          style: 'Artisan Slider & Flatbread Feast',
          items: [
            'Smoked brisket sliders with house-made pickled red onion slaw',
            'Caprese flatbread with fresh buffalo mozzarella, heirloom tomatoes, and basil',
            'Sweet potato waffle fries with garlic truffle aioli',
            'Tiered celebration funfetti cake with buttercream and edible gold leaf',
          ],
          notes: 'Crowd-pleaser suitable for varied age demographics.',
        },
      ],
    };
  }

  // Community gathering default
  return {
    source: 'fallback',
    themeIdeas: [
      {
        title: 'Neighborhood Unity & Harvest Festival',
        description:
          'Welcoming, inclusive festival celebrating local community talents, makers, culture, and shared civic connection.',
        decorNotes:
          'High-visibility recyclable directional banners, cheerful bunting flags, community bulletin chalkboard, and shade canopies.',
        colorPalette: ['#15803d', '#22c55e', '#eab308', '#0284c7', '#475569'],
      },
      {
        title: 'Eco-Green Future & Maker Fair',
        description:
          'Hands-on sustainability festival featuring repair cafes, urban gardening demonstrations, and youth science exhibits.',
        decorNotes:
          'Repurposed wood exhibition tables, solar-powered mobile chargers, potted native flora, and living plant centerpieces.',
        colorPalette: ['#166534', '#15803d', '#86efac', '#0f766e', '#f0fdf4'],
      },
      {
        title: 'Cultural Heritage Food & Arts Showcase',
        description:
          'A vibrant mosaic celebrating global cuisines, traditional dances, craft workshops, and storytelling.',
        decorNotes:
          'Multi-colored fabric flags, welcome signage in 6 prominent community languages, and open central amphitheater.',
        colorPalette: ['#b91c1c', '#ea580c', '#facc15', '#0284c7', '#7e22ce'],
      },
    ],
    activities: [
      {
        title: 'Community Collaborative Mural Canvas',
        description:
          'A large outdoor canvas where attendees of all ages paint their handprints, memories, and neighborhood hopes.',
        targetGroup: 'Families & Children',
        durationMinutes: 180,
      },
      {
        title: 'Local Makers & Talent Showcase Stage',
        description:
          'Rotating 20-minute performance slots for neighborhood musicians, youth orchestras, martial arts demos, and poetry.',
        targetGroup: 'General audience',
        durationMinutes: 150,
      },
      {
        title: 'Community Scavenger Hunt & Passport',
        description:
          'Attendees collect stamps by visiting information stalls, waste-sorting challenges, and volunteer booths for prize drawings.',
        targetGroup: 'Youth & Active adults',
        durationMinutes: 90,
      },
    ],
    menuSuggestions: [
      {
        style: 'Diverse Food Truck Rally & Beverage Refill Hub',
        items: [
          'Local food truck selections: Wood-fired pizza, Asian dumplings, and Mexican tacos',
          'Free filtered ice-water hydration stations (encourage reusable bottles)',
          'Locally sourced bakery pretzels, fresh apples, and popcorn bags',
          'Fresh-squeezed fruit lemonades and fair-trade iced teas',
        ],
        notes:
          'Reduces organizer prep overhead by partnering with vetted licensed local food vendors.',
      },
    ],
  };
}
