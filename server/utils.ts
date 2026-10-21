/** Converts untrusted input to a bounded string. */
export function clip(value: unknown, max = 100): string {
  return String(value ?? '').slice(0, max);
}

/** Converts an untrusted list to a bounded, comma-separated string. */
export function clipList(
  value: unknown,
  fallback: string,
  maxItems: number,
  maxLength = 30,
): string {
  if (!Array.isArray(value)) return fallback;
  return value
    .slice(0, maxItems)
    .map((item: unknown) => clip(item, maxLength))
    .join(', ');
}
