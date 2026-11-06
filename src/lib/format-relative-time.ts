/** Social API often returns pre-formatted labels (`5h`, `now`) — mobile displays as-is. */
const BACKEND_RELATIVE_TIME = /^\d+[mhd]$/i;

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower === "now") return "just now";
  if (BACKEND_RELATIVE_TIME.test(trimmed)) return trimmed;

  const then = new Date(trimmed).getTime();
  if (!Number.isFinite(then)) return trimmed;
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  return new Date(trimmed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
