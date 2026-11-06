"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { JobDetailSection } from "@/components/jobs/job-detail-section";
import type { JobApplication } from "@/features/jobs/types/job.types";

function formatAppliedAt(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function applicantName(app: JobApplication) {
  const a = app.applicant;
  if (!a) return "Applicant";
  const full = [a.firstName, a.lastName].filter(Boolean).join(" ");
  return full || a.userName || "Applicant";
}

export function JobApplicationsSection({
  applications,
}: {
  applications: JobApplication[];
}) {
  if (!applications.length) return null;

  return (
    <JobDetailSection title={`Applications (${applications.length})`}>
      <ul className="space-y-3">
        {applications.map((app) => (
          <li
            key={app.id}
            className="rounded-lg border border-border/80 bg-card p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                {app.applicant?.profilePicture ? (
                  <AvatarImage src={app.applicant.profilePicture} alt="" />
                ) : null}
                <AvatarPlaceholderFallback />
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                {app.applicant?.userName ? (
                  <Link
                    href={`/u/${app.applicant.userName}`}
                    className="font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {applicantName(app)}
                  </Link>
                ) : (
                  <p className="font-semibold">{applicantName(app)}</p>
                )}
                {app.applicant?.userRole ? (
                  <p className="text-xs text-muted-foreground">
                    {app.applicant.userRole}
                  </p>
                ) : null}
                {app.createdAt ? (
                  <p className="text-xs text-muted-foreground">
                    Applied {formatAppliedAt(app.createdAt)}
                  </p>
                ) : null}
              </div>
            </div>

            {app.contactEmail || app.contactPhone ? (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {app.contactEmail ? <span>{app.contactEmail}</span> : null}
                {app.contactPhone ? <span>{app.contactPhone}</span> : null}
              </div>
            ) : null}

            {app.coverLetter ? (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-4">
                &ldquo;{app.coverLetter}&rdquo;
              </p>
            ) : null}

            {app.resumeUrl ? (
              <a
                href={app.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="h-4 w-4" aria-hidden />
                View resume
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </JobDetailSection>
  );
}
