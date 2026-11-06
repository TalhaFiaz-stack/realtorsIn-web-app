"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { JobDetailAside } from "@/components/jobs/job-detail-aside";
import { JobDetailSection } from "@/components/jobs/job-detail-section";
import { Button } from "@/components/ui/button";
import { JobApplicationsSection } from "@/components/jobs/job-applications-section";
import { RemoteImg } from "@/components/shared/remote-img";
import type { JobPost } from "@/features/jobs/types/job.types";

type Props = {
  job: JobPost;
  posterName: string;
  isOwner: boolean;
  onApply: () => void;
  statusMutationPending: boolean;
  onStatusChange: (status: string) => void;
  onDelete?: () => void;
  deletePending?: boolean;
};

export function JobDetailBody(props: Props) {
  const { job, isOwner, onApply } = props;
  const heroImage = job.images[0]?.url;
  const galleryRest = job.images.slice(1);
  const canApplyInApp =
    !job.hasApplied && job.status === "active" && !isOwner;
  const showExternal =
    Boolean(job.applicationUrl) && !job.hasApplied && job.status === "active";
  const showMobileBar =
    !isOwner && (canApplyInApp || job.hasApplied || showExternal);

  return (
    <div className="space-y-4">
      {heroImage ? (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <RemoteImg
            src={heroImage}
            alt=""
            wrapperClassName="w-full max-h-[220px] md:max-h-[280px]"
            className="max-h-[220px] w-full object-cover md:max-h-[280px]"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
        <div className="min-w-0 space-y-6 rounded-xl border border-border/80 bg-card p-5 shadow-sm md:p-6">
          <header className="space-y-3">
            {job.company ? (
              <p className="text-sm font-semibold text-primary">{job.company}</p>
            ) : null}
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-[1.65rem]">
              {job.title}
            </h1>
            {job.location ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {job.location}
              </p>
            ) : null}
          </header>

          {job.skills.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-foreground"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="space-y-8">
            {job.description ? (
              <JobDetailSection title="About the role">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </JobDetailSection>
            ) : null}

            {job.requirements ? (
              <JobDetailSection title="Requirements">
                <p className="whitespace-pre-wrap">{job.requirements}</p>
              </JobDetailSection>
            ) : null}

            {job.benefits ? (
              <JobDetailSection title="Benefits">
                <p className="whitespace-pre-wrap">{job.benefits}</p>
              </JobDetailSection>
            ) : null}

            {galleryRest.length > 0 ? (
              <JobDetailSection title="Gallery">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {galleryRest.map((img, index) => (
                    <RemoteImg
                      key={`${img.url}-${index}`}
                      src={img.url}
                      alt=""
                      wrapperClassName="aspect-[4/3] w-full rounded-lg ring-1 ring-border/60"
                      skeletonClassName="rounded-lg"
                      className="aspect-[4/3] h-full w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              </JobDetailSection>
            ) : null}

            {isOwner && job.applications?.length ? (
              <JobApplicationsSection applications={job.applications} />
            ) : null}
          </div>
        </div>

        <div className="hidden lg:block">
          <JobDetailAside {...props} />
        </div>
      </div>

      {/* Mobile apply bar */}
      {showMobileBar ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg gap-2">
            {job.hasApplied ? (
              <p className="flex flex-1 items-center justify-center text-sm font-semibold text-primary">
                Application submitted
              </p>
            ) : (
              <Button
                type="button"
                className="h-11 flex-1 rounded-lg text-base font-semibold"
                onClick={onApply}
              >
                Easy Apply
              </Button>
            )}
            {showExternal ? (
              <Button asChild variant="outline" className="h-11 rounded-lg px-4">
                <Link
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="lg:hidden">
        <JobDetailAside {...props} showApplyActions={false} />
      </div>

      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
