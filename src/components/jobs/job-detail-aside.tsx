"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Mail, Share2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { toExternalUrl } from "@/lib/format/external-url";
import { ContentShareDialog } from "@/components/chat/content-share-dialog";
import { JobListingStatusDropdown } from "@/components/jobs/job-listing-status-dropdown";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  formatJobSalary,
  formatJobStatusLabel,
  JOB_STATUS_STYLES,
} from "@/features/jobs/lib/format-job";
import {
  buildJobPublicUrl,
  buildJobShareMessage,
} from "@/features/jobs/lib/job-share";
import type { JobPost } from "@/features/jobs/types/job.types";
import { cn } from "@/lib/utils";

type Props = {
  job: JobPost;
  posterName: string;
  isOwner: boolean;
  onApply: () => void;
  statusMutationPending: boolean;
  onStatusChange: (status: string) => void;
  /** False on mobile when a fixed apply bar is shown. */
  showApplyActions?: boolean;
  onDelete?: () => void;
  deletePending?: boolean;
};

export function JobDetailAside({
  job,
  posterName,
  isOwner,
  onApply,
  statusMutationPending,
  onStatusChange,
  showApplyActions = true,
  onDelete,
  deletePending,
}: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const jobUrl = useMemo(() => buildJobPublicUrl(job.id), [job.id]);
  const jobShareMessage = useMemo(
    () => buildJobShareMessage(job, jobUrl),
    [job, jobUrl]
  );
  const salary = formatJobSalary(job);
  const statusClass = JOB_STATUS_STYLES[job.status] ?? JOB_STATUS_STYLES.active;
  const canApplyInApp = !job.hasApplied && job.status === "active" && !isOwner;
  const externalHref = toExternalUrl(job.applicationUrl);
  const showExternal = Boolean(externalHref) && !job.hasApplied && job.status === "active" && !isOwner;
  const applyEmail = job.applicationEmail?.includes("@") ? job.applicationEmail.trim() : null;
  const showEmail = Boolean(applyEmail) && !job.hasApplied && job.status === "active" && !isOwner;
  const posterHref = job.poster?.userName
    ? `/u/${job.poster.userName}`
    : job.poster?.id
      ? `/profile/${job.poster.id}`
      : null;

  return (
    <aside className="lg:sticky lg:top-[4.25rem] lg:self-start">
      <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {!isOwner && showApplyActions ? (
          <div className="space-y-2">
            {job.hasApplied ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You applied
                    {job.appliedAt ? (
                      <span className="font-normal text-muted-foreground"> · {formatRelativeTime(job.appliedAt)}</span>
                    ) : null}
                  </p>
                  {job.applicationStatus ? (
                    <p className="mt-0.5 text-xs font-semibold capitalize text-primary">
                      Status: {job.applicationStatus.replace(/_/g, " ")}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    The poster can review your profile and reach out.
                  </p>
                </div>
              </div>
            ) : null}
            {canApplyInApp ? (
              <Button
                type="button"
                className="h-11 w-full rounded-full text-base font-semibold"
                onClick={onApply}
              >
                Easy Apply
              </Button>
            ) : null}
            {showExternal ? (
              <Button asChild variant="outline" className="h-10 w-full rounded-full">
                <a href={externalHref!} target="_blank" rel="noopener noreferrer">
                  Apply on company website
                  <ExternalLink className="ml-1.5 h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : null}
            {showEmail ? (
              <Button asChild variant="ghost" className="h-9 w-full rounded-full text-sm">
                <a
                  href={`mailto:${applyEmail}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                >
                  <Mail className="mr-1.5 h-4 w-4" aria-hidden />
                  Apply by email
                </a>
              </Button>
            ) : null}
            {job.status !== "active" && !job.hasApplied ? (
              <p className="text-center text-xs text-muted-foreground">
                Not accepting applications ·{" "}
                {formatJobStatusLabel(job.status)}
              </p>
            ) : null}
          </div>
        ) : null}

        <dl className="space-y-2.5 border-t border-border/80 pt-3 text-sm">
          {salary ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Compensation</dt>
              <dd className="text-end font-medium text-foreground">{salary}</dd>
            </div>
          ) : null}
          {job.employmentType ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Employment</dt>
              <dd className="text-end font-medium">{job.employmentType}</dd>
            </div>
          ) : null}
          {job.jobType ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Workplace</dt>
              <dd className="text-end font-medium">{job.jobType}</dd>
            </div>
          ) : null}
          {job.experienceLevel ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Experience</dt>
              <dd className="text-end font-medium">{job.experienceLevel}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Applicants</dt>
            <dd className="text-end font-medium tabular-nums">{job.applicationsCount}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Listing</dt>
            <dd>
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                  statusClass
                )}
              >
                {formatJobStatusLabel(job.status)}
              </span>
            </dd>
          </div>
        </dl>

        {job.poster ? (
          <div className="flex items-center gap-3 border-t border-border/80 pt-3">
            <Avatar className="h-11 w-11 ring-2 ring-background">
              {job.poster.profilePicture ? (
                <AvatarImage src={job.poster.profilePicture} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            <div className="min-w-0 text-sm">
              <p className="text-xs text-muted-foreground">Hiring contact</p>
              {posterHref ? (
                <Link
                  href={posterHref}
                  className="font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {posterName}
                </Link>
              ) : (
                <p className="font-semibold">{posterName}</p>
              )}
            </div>
          </div>
        ) : null}

        {isOwner ? (
          <div className="space-y-3 border-t border-border/80 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your posting
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-md">
                <Link href={`/jobs/${job.id}/edit`}>Edit job</Link>
              </Button>
              {onDelete ? (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="rounded-md"
                  disabled={deletePending}
                  onClick={onDelete}
                >
                  {deletePending ? "Deleting…" : "Delete"}
                </Button>
              ) : null}
            </div>
            <JobListingStatusDropdown
              job={job}
              disabled={statusMutationPending}
              onSelectStatus={onStatusChange}
            />
          </div>
        ) : null}

        {job.status === "active" ? (
          <div className="border-t border-border/80 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full rounded-full"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Share job
            </Button>
          </div>
        ) : null}
      </div>

      <ContentShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        dialogTitle="Share Job"
        publicUrl={jobUrl}
        externalTitle={job.title}
        externalMessage={jobShareMessage}
        chatEntity={{ type: "job", jobId: job.id }}
      />
    </aside>
  );
}
