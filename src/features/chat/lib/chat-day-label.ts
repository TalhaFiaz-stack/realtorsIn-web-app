function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isSameChatDay(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const da = parse(a);
  const db = parse(b);
  if (!da || !db) return true;
  return startOfDay(da) === startOfDay(db);
}

/** "Today", "Yesterday", weekday within a week, else "Nov 3, 2026". */
export function chatDayLabel(value: string, now: Date = new Date()): string {
  const d = parse(value);
  if (!d) return "";
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}
