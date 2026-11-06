/** REM listings use rem_property_id >= 1; 0 must not be sent (breaks Social API lookup). */
export function normalizeRemPropertyId(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
