import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, getConfiguredModel, isProduction } from '../server/config';
import { generateWithFallback, getGenAI } from '../server/gemini';

type Ai = Parameters<typeof generateWithFallback>[0];

function fakeAi(generateContent: ReturnType<typeof vi.fn>): Ai {
  return { models: { generateContent } } as unknown as Ai;
}

describe('server config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses GEMINI_MODEL when set and the default otherwise', () => {
    vi.stubEnv('GEMINI_MODEL', 'my-model');
    expect(getConfiguredModel()).toBe('my-model');
    vi.stubEnv('GEMINI_MODEL', '');
    expect(getConfiguredModel()).toBe(DEFAULT_MODEL);
  });

  it('detects production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isProduction()).toBe(true);
    vi.stubEnv('NODE_ENV', 'development');
    expect(isProduction()).toBe(false);
  });
});

describe('Gemini client wrapper', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null without an API key and a reusable client with one', () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    expect(getGenAI()).toBeNull();
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const first = getGenAI();
    expect(first).not.toBeNull();
    expect(getGenAI()).toBe(first);
  });

  it('uses the configured model first', async () => {
    vi.stubEnv('GEMINI_MODEL', 'custom-model');
    const generate = vi.fn().mockResolvedValue({ text: 'hi' });
    const res = await generateWithFallback(fakeAi(generate), 'prompt', {});
    expect(res.text).toBe('hi');
    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate.mock.calls[0][0].model).toBe('custom-model');
  });

  it('retries once with the default model when the configured model fails', async () => {
    vi.stubEnv('GEMINI_MODEL', 'bad-model');
    const generate = vi
      .fn()
      .mockRejectedValueOnce(new Error('model not found'))
      .mockResolvedValueOnce({ text: 'recovered' });
    const res = await generateWithFallback(fakeAi(generate), 'prompt', {});
    expect(res.text).toBe('recovered');
    expect(generate.mock.calls[1][0].model).toBe(DEFAULT_MODEL);
  });

  it('throws when both attempts fail so callers can use the offline fallback', async () => {
    const generate = vi.fn().mockRejectedValue(new Error('down'));
    await expect(generateWithFallback(fakeAi(generate), 'prompt', {})).rejects.toThrow('down');
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
