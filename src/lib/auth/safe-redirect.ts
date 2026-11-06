/**
 * Prevents open redirects via the `next` query parameter.
 * Only same-origin relative paths are allowed.
 */
export function getSafeNextPath(
  next: string | null | undefined,
  fallback = "/feed"
): string {
  if (!next) {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) {
    return fallback;
  }
  if (trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }
  if (trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}
