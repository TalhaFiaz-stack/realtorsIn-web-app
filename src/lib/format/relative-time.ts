export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Unknown";
  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 604800)}w ago`;
}

export function formatAnalyticsPeriod(period: string | null | undefined): string {
  if (!period) return "";
  return period.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
