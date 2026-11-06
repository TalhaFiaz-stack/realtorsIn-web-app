"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { JobListingStatusDropdown } from "@/components/jobs/job-listing-status-dropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JobPost } from "@/features/jobs/types/job.types";

export function JobPostedCard({
  job,
  onDelete,
  onStatusChange,
  deletePending,
  statusChangePending,
}: {
  job: JobPost;
  onDelete: (jobId: number) => void;
  onStatusChange?: (jobId: number, status: string) => void;
  deletePending?: boolean;
  statusChangePending?: boolean;
}) {
  return (
    <div className="relative h-full">
      <JobCard job={job} showStatus={false} />
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
        {onStatusChange ? (
          <JobListingStatusDropdown
            job={job}
            disabled={statusChangePending}
            onSelectStatus={(status) => onStatusChange(job.id, status)}
          />
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full border-border/80 bg-card/95 shadow-sm backdrop-blur-sm hover:bg-card"
              aria-label="Job actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/jobs/${job.id}/edit`} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={deletePending}
              onClick={(e) => {
                e.preventDefault();
                onDelete(job.id);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
