import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type FontSizeMode = 'normal' | 'large' | 'xlarge';

const THEME_KEY = 'celebration_theme';
const FONT_SIZE_KEY = 'celebration_font_size';
const CONTRAST_KEY = 'celebration_contrast';

const FONT_SIZE_ORDER: readonly FontSizeMode[] = ['normal', 'large', 'xlarge'];

/** Persists a value, ignoring storage failures (private mode / blocked storage). */
function persist(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (private mode / blocked): safe to ignore
  }
}

/** Reads the saved theme, falling back to the OS color-scheme preference. */
function readInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Reads the saved font size mode, defaulting to "normal". */
function readInitialFontSize(): FontSizeMode {
  try {
    return (localStorage.getItem(FONT_SIZE_KEY) as FontSizeMode | null) || 'normal';
  } catch {
    return 'normal';
  }
}

/** Reads the saved high-contrast flag. */
function readInitialContrast(): boolean {
  try {
    return localStorage.getItem(CONTRAST_KEY) === 'high';
  } catch {
    return false;
  }
}

/** Returns the next font size in the normal -> large -> xlarge -> normal cycle. */
export function nextFontSize(current: FontSizeMode): FontSizeMode {
  const index = FONT_SIZE_ORDER.indexOf(current);
  return FONT_SIZE_ORDER[(index + 1) % FONT_SIZE_ORDER.length];
}

/**
 * Manages theme, font size and high-contrast preferences.
 * Applies them to the <html> element and persists them in localStorage.
 */
export function useDisplayPreferences() {
  const [theme, setTheme] = useState<ThemeMode>(readInitialTheme);
  const [fontSize, setFontSize] = useState<FontSizeMode>(readInitialFontSize);
  const [highContrast, setHighContrast] = useState<boolean>(readInitialContrast);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    persist(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    persist(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  useEffect(() => {
    const mode = highContrast ? 'high' : 'normal';
    document.documentElement.setAttribute('data-contrast', mode);
    persist(CONTRAST_KEY, mode);
  }, [highContrast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const cycleFontSize = useCallback(() => {
    setFontSize(nextFontSize);
  }, []);

  const toggleContrast = useCallback(() => {
    setHighContrast((prev) => !prev);
  }, []);

  return { theme, fontSize, highContrast, toggleTheme, cycleFontSize, toggleContrast };
}
