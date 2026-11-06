"use client";

import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import {
  formatJobLocationShort,
  formatJobSalary,
  formatJobStatusLabel,
  JOB_STATUS_STYLES,
} from "@/features/jobs/lib/format-job";
import { RemoteImg } from "@/components/shared/remote-img";
import type { JobPost } from "@/features/jobs/types/job.types";
import { cn } from "@/lib/utils";

/** Shared with `JobCardSkeleton` — keep in sync. */
export const JOB_CARD_IMAGE_HEIGHT = "h-[5.25rem] shrink-0 sm:h-[5.5rem]";

export const JOB_CARD_BODY_MIN = "min-h-[8.25rem]";

const CARD_SHELL =
  "group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_2px_7px_rgba(15,23,42,0.06)] transition-[box-shadow,border-color] hover:border-border hover:shadow-[0_4px_14px_rgba(15,23,42,0.09)] dark:shadow-none";

function JobCardBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[9rem] items-center truncate rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

function JobCardFooter({
  skills,
  description,
}: {
  skills: string[];
  description: string | null;
}) {
  const visibleSkills = skills.slice(0, 3);
  const extraSkills = skills.length - visibleSkills.length;
  const desc = description?.replace(/\s+/g, " ").trim() ?? "";

  return (
    <div className="mt-auto min-h-[1.75rem] pt-1.5">
      {visibleSkills.length > 0 ? (
        <div className="flex max-h-[2.5rem] flex-wrap gap-1.5 overflow-hidden">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex max-w-full truncate rounded-full bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-foreground/85"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 ? (
            <span className="inline-flex rounded-full bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              +{extraSkills}
            </span>
          ) : null}
        </div>
      ) : desc ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      ) : null}
    </div>
  );
}

export function JobCard({
  job,
  showStatus = false,
  reserveHeaderSpace = false,
}: {
  job: JobPost;
  showStatus?: boolean;
  reserveHeaderSpace?: boolean;
}) {
  const salary = formatJobSalary(job);
  const applicationStatusKey = job.applicationStatus?.toLowerCase() ?? "";
  const statusKey = showStatus && applicationStatusKey
    ? applicationStatusKey
    : job.status.toLowerCase();
  const statusClass = JOB_STATUS_STYLES[statusKey] ?? JOB_STATUS_STYLES.active;
  const thumb = job.images[0]?.url;
  const locationShort = job.location
    ? formatJobLocationShort(job.location)
    : "";
  const company = job.company?.trim() ?? "";
  const subtitle = [company, locationShort].filter(Boolean).join(" · ");
  const metaParts = [job.employmentType, job.jobType].filter(Boolean);
  const visibleMeta = metaParts.slice(0, 2);
  const extraMeta = metaParts.length - visibleMeta.length;

  const statusBadge = showStatus ? (
    <JobCardBadge className={cn("shadow-sm ring-1 ring-border/70", statusClass)}>
      {formatJobStatusLabel(
        showStatus && job.applicationStatus
          ? job.applicationStatus
          : job.status
      )}
    </JobCardBadge>
  ) : job.hasApplied ? (
    <JobCardBadge className="bg-primary/90 text-primary-foreground">
      Applied
    </JobCardBadge>
  ) : null;

  return (
    <Link href={`/jobs/${job.id}`} className={CARD_SHELL}>
      <div className={cn("relative w-full bg-muted", JOB_CARD_IMAGE_HEIGHT)}>
        {thumb ? (
          <>
            <RemoteImg
              src={thumb}
              alt=""
              wrapperClassName="h-full w-full"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100/80 dark:from-muted dark:via-muted/90 dark:to-muted/70">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15 dark:ring-primary/25"
              aria-hidden
            >
              <Briefcase
                className="h-5 w-5 text-primary dark:text-primary/90"
                strokeWidth={1.5}
              />
            </span>
          </div>
        )}
        <div
          className={cn(
            "absolute inset-x-0 top-0 flex items-start justify-end gap-2 p-2",
            reserveHeaderSpace && "pe-11"
          )}
        >
          {statusBadge}
        </div>
        {salary ? (
          <p className="absolute bottom-2 start-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {salary}
          </p>
        ) : null}
      </div>

      <div className={cn("flex flex-1 flex-col p-3", JOB_CARD_BODY_MIN)}>
        <h2 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
          {job.title}
        </h2>

        <p
          className={cn(
            "mt-1 flex h-[1.125rem] min-w-0 items-center gap-1.5 text-xs text-muted-foreground",
            !subtitle && "invisible"
          )}
          aria-hidden={!subtitle}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span className="truncate" title={subtitle || undefined}>
            {subtitle || "—"}
          </span>
        </p>

        <div className="mt-2 flex min-h-[1.375rem] flex-wrap items-center gap-1.5">
          {visibleMeta.map((part) => (
            <span
              key={part}
              className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80"
            >
              {part}
            </span>
          ))}
          {extraMeta > 0 ? (
            <span className="text-[11px] font-medium text-muted-foreground">
              +{extraMeta}
            </span>
          ) : null}
        </div>

        <JobCardFooter skills={job.skills} description={job.description} />
      </div>
    </Link>
  );
}
