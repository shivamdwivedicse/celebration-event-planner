import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCuratedFallbackIdeas } from '../src/ai/fallback.ts';
import { fetchPersonalizedIdeas, fetchChatResponse } from '../src/ai/gemini.ts';
import { EventPlanInput } from '../src/types.ts';

describe('AI Service & Offline Fallback Engine', () => {
  const sampleWedding: EventPlanInput = {
    eventType: 'wedding',
    eventName: 'Garden Wedding',
    eventDate: '2027-06-15',
    guestCount: 100,
    budget: 25000,
    venueType: 'outdoor',
    priorities: ['food', 'photography'],
  };

  const sampleBirthday: EventPlanInput = {
    eventType: 'birthday',
    eventName: 'Alex 30th Birthday',
    eventDate: '2027-05-10',
    guestCount: 40,
    budget: 2500,
    venueType: 'home',
    priorities: ['entertainment'],
  };

  const sampleCommunity: EventPlanInput = {
    eventType: 'community',
    eventName: 'Neighborhood Eco Fair',
    eventDate: '2027-08-01',
    guestCount: 200,
    budget: 5000,
    venueType: 'outdoor',
    priorities: ['decor'],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates rich, valid curated fallback ideas for weddings', () => {
    const ideas = getCuratedFallbackIdeas(sampleWedding);
    expect(ideas.source).toBe('fallback');
    expect(ideas.themeIdeas.length).toBeGreaterThanOrEqual(2);
    expect(ideas.activities.length).toBeGreaterThanOrEqual(2);
    expect(ideas.menuSuggestions.length).toBeGreaterThanOrEqual(1);

    const firstTheme = ideas.themeIdeas[0];
    expect(firstTheme.colorPalette.length).toBeGreaterThanOrEqual(3);
    expect(firstTheme.decorNotes).toBeTruthy();
  });

  it('generates tailored fallback ideas for birthdays and community festivals', () => {
    const bdayIdeas = getCuratedFallbackIdeas(sampleBirthday);
    expect(bdayIdeas.source).toBe('fallback');
    expect(
      bdayIdeas.themeIdeas.some((t) => t.title.includes('Bistro') || t.title.includes('Arcade')),
    ).toBe(true);

    const commIdeas = getCuratedFallbackIdeas(sampleCommunity);
    expect(commIdeas.source).toBe('fallback');
    expect(
      commIdeas.activities.some((a) => a.title.includes('Mural') || a.title.includes('Makers')),
    ).toBe(true);
  });

  it('seamlessly falls back to curated ideas when network/server returns 500 or is offline', async () => {
    // Mock global fetch to simulate network error
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network connection failed')));

    const ideas = await fetchPersonalizedIdeas(sampleWedding);
    expect(ideas).toBeDefined();
    expect(ideas.source).toBe('fallback');
    expect(ideas.themeIdeas.length).toBeGreaterThan(0);
  });

  it('utilizes LRU cache for identical requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        source: 'ai',
        themeIdeas: [
          {
            title: 'Mock AI Theme',
            description: 'AI Generated Description',
            decorNotes: 'Floral and lighting',
            colorPalette: ['#111111', '#222222', '#333333'],
          },
        ],
        activities: [
          {
            title: 'Mock Activity',
            description: 'Activity details',
            targetGroup: 'All',
            durationMinutes: 45,
          },
        ],
        menuSuggestions: [
          {
            style: 'Plated',
            items: ['Salad', 'Steak'],
            notes: 'GF available',
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', mockFetch);

    const firstCall = await fetchPersonalizedIdeas(sampleWedding, true);
    expect(firstCall.source).toBe('ai');
    expect(firstCall.themeIdeas[0].title).toBe('Mock AI Theme');

    // Second call with same plan should hit LRU cache and avoid redundant network fetch
    const secondCall = await fetchPersonalizedIdeas(sampleWedding, false);
    expect(secondCall.cached).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('provides safe offline fallback for conversational chat when network fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Server unavailable')));

    const chatReply = await fetchChatResponse(
      'How many drinks should we plan for our wedding?',
      sampleWedding,
    );
    expect(chatReply.source).toBe('fallback');
    expect(chatReply.text).toContain('drinks per adult');
  });
});
