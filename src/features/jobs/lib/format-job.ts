import type { JobPost } from "@/features/jobs/types/job.types";

export const JOB_STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-800 dark:text-amber-400",
  closed: "bg-red-500/10 text-red-700 dark:text-red-400",
  draft: "bg-muted text-muted-foreground",
  pending: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  reviewed: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  shortlisted: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

function isMeaningfulSalary(value: number | null): boolean {
  return value != null && Number.isFinite(value) && value > 0;
}

export function formatJobSalary(job: JobPost): string | null {
  const hasMin = isMeaningfulSalary(job.salaryMin);
  const hasMax = isMeaningfulSalary(job.salaryMax);
  if (!hasMin && !hasMax) return null;

  const cur = job.salaryCurrency?.trim() || "";
  if (hasMin && hasMax) {
    return [cur, `${job.salaryMin} – ${job.salaryMax}`].filter(Boolean).join(" ");
  }
  const amount = hasMin ? job.salaryMin : job.salaryMax;
  return [cur, amount != null ? String(amount) : ""].filter(Boolean).join(" ");
}

/** Short label for cards; full string available via title attribute. */
export function formatJobLocationShort(location: string, maxLen = 42): string {
  const trimmed = location.trim();
  if (!trimmed) return "";
  const primary = trimmed.split(" - ")[0]?.split(",")[0]?.trim() || trimmed;
  if (primary.length <= maxLen) return primary;
  return `${primary.slice(0, maxLen - 1)}…`;
}

export function formatJobStatusLabel(status: string): string {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
}
