import { useCallback, useEffect, useState } from 'react';
import { fetchPersonalizedIdeas } from '../ai/gemini.ts';
import { EventPlanInput, IdeasResult } from '../types.ts';

/**
 * Loads personalized creative ideas (Gemini with offline fallback) whenever
 * the plan changes, and exposes loading/error state plus a manual refresh.
 */
export function useIdeas(plan: EventPlanInput) {
  const [ideas, setIdeas] = useState<IdeasResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadIdeas = useCallback(async (target: EventPlanInput, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      setIdeas(await fetchPersonalizedIdeas(target, forceRefresh));
    } catch {
      setError('Could not refresh creative ideas. Offline fallback was applied.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdeas(plan, false);
  }, [plan, loadIdeas]);

  const clearError = useCallback(() => setError(null), []);

  return { ideas, isLoading, error, clearError, loadIdeas };
}