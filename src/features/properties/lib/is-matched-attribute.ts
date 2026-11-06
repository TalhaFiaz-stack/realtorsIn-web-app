/** Normalized keys from POST /api/posts/property/match `matched_attributes`. */
export function isMatchedAttribute(
  matchedAttributes: string[] | undefined,
  keys: string | readonly string[]
): boolean {
  if (!matchedAttributes?.length) return false;
  const set = new Set(
    matchedAttributes.map((k) => k.trim().toLowerCase()).filter(Boolean)
  );
  const list = typeof keys === "string" ? [keys] : keys;
  return list.some((k) => set.has(k.toLowerCase()));
}

export const MATCH_PRICE_KEYS = ["price_start", "price_end"] as const;
export const MATCH_AREA_KEYS = ["area_start", "area_end"] as const;
