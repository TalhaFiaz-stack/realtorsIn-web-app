"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JOB_LISTING_STATUS_OPTIONS } from "@/features/jobs/constants/jobs.constants";
import {
  formatJobStatusLabel,
  JOB_STATUS_STYLES,
} from "@/features/jobs/lib/format-job";
import type { JobPost } from "@/features/jobs/types/job.types";
import { cn } from "@/lib/utils";

export function JobListingStatusDropdown({
  job,
  disabled,
  onSelectStatus,
}: {
  job: JobPost;
  disabled?: boolean;
  onSelectStatus: (status: string) => void;
}) {
  const statusKey = job.status.toLowerCase();
  const statusClass = JOB_STATUS_STYLES[statusKey] ?? JOB_STATUS_STYLES.active;
  const choices = JOB_LISTING_STATUS_OPTIONS.filter(
    (status) => status !== job.status
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || choices.length === 0}
          className={cn(
            "inline-flex max-w-[9.5rem] items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm ring-1 ring-border/70 backdrop-blur-sm transition-opacity hover:opacity-95 disabled:opacity-60",
            statusClass
          )}
          aria-label={`Job status: ${formatJobStatusLabel(job.status)}. Change status`}
        >
          <span className="truncate">{formatJobStatusLabel(job.status)}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8.5rem]">
        {choices.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={disabled}
            onSelect={() => onSelectStatus(status)}
          >
            {formatJobStatusLabel(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
