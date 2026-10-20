/**
 * Client-side Gemini AI service wrapper.
 * Features:
 * - In-memory LRU cache to prevent redundant requests
 * - Request timeout via AbortController
 * - 1 automatic retry on transient failure
 * - Output truncation and sanitization guard
 * - Seamless offline fallback to getCuratedFallbackIdeas()
 * - Security: API calls are proxied through server-side /api/ai endpoints; no keys in browser
 */

import { SYSTEM_LIMITS } from '../config.ts';
import { EventPlanInput, IdeasResult } from '../types.ts';
import { getCuratedFallbackIdeas } from './fallback.ts';

/**
 * Lightweight in-memory LRU cache for responses.
 */
class SimpleLRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxEntries: number;

  constructor(maxEntries = SYSTEM_LIMITS.LRU_CACHE_MAX_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const val = this.cache.get(key)!;
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Remove oldest
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

const ideasCache = new SimpleLRUCache<string, IdeasResult>();
const chatCache = new SimpleLRUCache<string, string>();

/**
 * Creates a unique deterministic hash key for an EventPlanInput.
 */
function createIdeasCacheKey(input: EventPlanInput): string {
  return `${input.eventType}-${input.venueType}-${input.guestCount}-${input.budget}-${input.priorities.slice().sort().join(',')}-${(input.notes || '').slice(0, 50)}`;
}

/**
 * Fetches personalized ideas with timeout, 1 retry, LRU caching, and offline fallback.
 */
export async function fetchPersonalizedIdeas(
  input: EventPlanInput,
  forceRefresh = false
): Promise<IdeasResult> {
  const cacheKey = createIdeasCacheKey(input);

  if (!forceRefresh) {
    const cached = ideasCache.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  let attempts = 0;
  const maxAttempts = 1 + SYSTEM_LIMITS.AI_MAX_RETRIES;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYSTEM_LIMITS.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.themeIdeas) && data.themeIdeas.length > 0) {
        const result: IdeasResult = {
          themeIdeas: data.themeIdeas.slice(0, 4),
          activities: Array.isArray(data.activities) ? data.activities.slice(0, 4) : [],
          menuSuggestions: Array.isArray(data.menuSuggestions) ? data.menuSuggestions.slice(0, 3) : [],
          source: data.source === 'ai' ? 'ai' : 'fallback',
        };
        ideasCache.set(cacheKey, result);
        return result;
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      // If last attempt, break to fallback
      if (attempts >= maxAttempts) {
        break;
      }
      // Brief pause before single retry
      await new Promise((res) => setTimeout(res, 400));
    }
  }

  // Graceful offline fallback
  const fallback = getCuratedFallbackIdeas(input);
  ideasCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Sends a chat question to the server-side assistant with plan context and offline fallback.
 */
export async function fetchChatResponse(
  message: string,
  currentPlan: EventPlanInput
): Promise<{ text: string; source: 'ai' | 'fallback' }> {
  const sanitizedMsg = message.trim().slice(0, SYSTEM_LIMITS.MAX_CHAT_INPUT_LENGTH);
  const cacheKey = `${currentPlan.eventType}-${currentPlan.budget}-${currentPlan.guestCount}:${sanitizedMsg}`;

  const cached = chatCache.get(cacheKey);
  if (cached) {
    return { text: cached, source: 'ai' };
  }

  let attempts = 0;
  const maxAttempts = 1 + SYSTEM_LIMITS.AI_MAX_RETRIES;

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYSTEM_LIMITS.AI_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: sanitizedMsg,
          currentPlan,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.text === 'string' && data.text.trim()) {
          const reply = data.text.trim().slice(0, 1000); // Guard max output size
          chatCache.set(cacheKey, reply);
          return { text: reply, source: data.source === 'ai' ? 'ai' : 'fallback' };
        }
      }
    } catch {
      clearTimeout(timeoutId);
      if (attempts >= maxAttempts) break;
      await new Promise((res) => setTimeout(res, 400));
    }
  }

  // Context-aware deterministic fallback response if AI or backend is offline
  const fallbackReply = generateFallbackChatAnswer(sanitizedMsg, currentPlan);
  chatCache.set(cacheKey, fallbackReply);
  return { text: fallbackReply, source: 'fallback' };
}

/**
 * Offline rule-based conversational assistant answer for common event questions.
 */
function generateFallbackChatAnswer(query: string, plan: EventPlanInput): string {
  const lower = query.toLowerCase();

  if (lower.includes('drink') || lower.includes('alcohol') || lower.includes('bar')) {
    const bottlesEstimate = Math.ceil((plan.guestCount * 4) / 5);
    return `For ${plan.guestCount} attendees over a standard 4-hour celebration, plan on roughly 4 drinks per adult (~${bottlesEstimate} standard 750ml bottles of wine/spirits combined, or roughly 50% wine, 30% beer, 20% spirits). Offer plenty of sparkling water and crafted non-alcoholic coolers.`;
  }

  if (lower.includes('music') || lower.includes('dj') || lower.includes('playlist')) {
    return `For a ${plan.eventType} at a ${plan.venueType} venue, structure your music in 3 energetic blocks: warm acoustic background during arrival (40-60 dB), mid-tempo grooves during dinner/refreshments, and high-energy dance favorites during the final 90 minutes.`;
  }

  if (lower.includes('rsvp') || lower.includes('invite') || lower.includes('invitation')) {
    return `Set your firm RSVP deadline exactly 3 weeks prior to your event date (${plan.eventDate}). Caterers typically require a guaranteed headcount lockdown 14 days in advance. Follow up via SMS with non-responders 4 days before the cutoff.`;
  }

  if (lower.includes('tip') || lower.includes('gratuity')) {
    return `Standard industry gratuity benchmarks: Caterer service staff: 15-20% of food bill (check contract first to verify if service fee already includes gratuity); DJ: $50-$150; Lead Photographer: $100-$200 or heartfelt review; Delivery drivers: $20-$40 each.`;
  }

  return `Great question regarding your ${plan.eventType}! With your $${plan.budget.toLocaleString()} budget and ${plan.guestCount} guests at a ${plan.venueType} location, we recommend focusing on guest comfort: ensure ample seating, quick beverage access within the first 10 minutes of arrival, and clean signage. Let me know if you would like me to adjust your budget, guest count, or venue type!`;
}
