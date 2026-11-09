/**
 * Prevents open redirects via the `next` query parameter.
 * Only same-origin relative paths are allowed.
 */
const PROBE_ORIGIN = "https://realtorsin.invalid";

export function getSafeNextPath(
  next: string | null | undefined,
  fallback = "/feed"
): string {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();
  // Browsers strip tabs/newlines while parsing URLs, so "/\t/evil.com"
  // becomes "//evil.com". Reject every control character outright.
  if (/[\x00-\x1f\x7f]/.test(trimmed)) {
    return fallback;
  }
  if (!trimmed.startsWith("/")) {
    return fallback;
  }
  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Final check: it must resolve to the same origin it started on.
  try {
    const url = new URL(trimmed, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) {
      return fallback;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
