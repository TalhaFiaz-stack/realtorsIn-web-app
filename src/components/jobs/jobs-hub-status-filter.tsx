"use client";

import {
  JOB_POSTED_STATUS_FILTERS,
  type JobPostedStatusFilter,
} from "@/features/jobs/constants/jobs.constants";
import { formatJobStatusLabel } from "@/features/jobs/lib/format-job";
import { cn } from "@/lib/utils";

export function JobsHubStatusFilter({
  value,
  onChange,
}: {
  value: JobPostedStatusFilter;
  onChange: (next: JobPostedStatusFilter) => void;
}) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Filter posted jobs by status"
    >
      {JOB_POSTED_STATUS_FILTERS.map((status) => {
        const active = value === status;
        const label =
          status === "All" ? "All" : formatJobStatusLabel(status);
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(status)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              active
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border/80 bg-background text-muted-foreground hover:border-border hover:text-foreground"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
