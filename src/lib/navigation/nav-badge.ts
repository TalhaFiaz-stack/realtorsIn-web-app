/** Nav badge counts always come from API/cache — never literal UI placeholders. */

export function normalizeNavBadgeCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.floor(n), 999);
}

/** Returns count for badge UI, or `undefined` when nothing to show. */
export function navBadgeFromCount(count: unknown): number | undefined {
  const normalized = normalizeNavBadgeCount(count);
  return normalized > 0 ? normalized : undefined;
}

export function formatNavBadgeLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}
