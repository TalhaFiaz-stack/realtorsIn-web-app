export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

export function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item != null);
}

export function capitalizeFirst(value: string): string {
  const t = value.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function firstEntry(
  row: Record<string, unknown>
): { key: string; value: string } | null {
  const entry = Object.entries(row)[0];
  if (!entry) return null;
  return { key: entry[0], value: String(entry[1] ?? "") };
}
