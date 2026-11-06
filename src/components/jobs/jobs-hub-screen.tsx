"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JobCard } from "@/components/jobs/job-card";
import { JobPostedCard } from "@/components/jobs/job-posted-card";
import { JobsListGridShimmer } from "@/components/jobs/job-shimmers";
import {
  HubTwoColumnGrid,
  HubTwoColumnGridItem,
} from "@/components/hub/hub-two-column-grid";
import {
  HubControlCard,
  HubControlCardBody,
  HubControlCardHeader,
} from "@/components/hub/hub-control-card";
import { HubModuleHeader } from "@/components/hub/hub-module-header";
import { HubSearchInput } from "@/components/hub/hub-search-input";
import { JobsHubStatusFilter } from "@/components/jobs/jobs-hub-status-filter";
import { HubSegmentTabs } from "@/components/hub/hub-segment-tabs";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import { useDeleteJob } from "@/features/jobs/hooks/use-job-mutations";
import {
  jobsErrorMessage,
  useChangeJobStatus,
  useJobsList,
} from "@/features/jobs/hooks/use-jobs";
import { useConfirm } from "@/components/common/confirm-provider";
import {
  CONFIRM_DELETE_JOB,
  confirmJobStatusChange,
} from "@/constants/confirm-copy";
import { showAppToast } from "@/lib/toast/app-toast";
import type { JobPostedStatusFilter } from "@/features/jobs/constants/jobs.constants";
import type { JobsHubTab } from "@/features/jobs/types/job.types";

const JOB_TAB_ITEMS: { id: JobsHubTab; title: string }[] = [
  { id: "discover", title: "Discover" },
  { id: "posted", title: "Posted" },
  { id: "applied", title: "Applied" },
];

export function JobsHubScreen() {
  const { confirm } = useConfirm();
  const [tab, setTab] = useState<JobsHubTab>("discover");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [postedStatusFilter, setPostedStatusFilter] =
    useState<JobPostedStatusFilter>("All");
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const query = useJobsList(
    tab,
    search || undefined,
    tab === "discover" ? geo : null,
    tab === "posted" ? postedStatusFilter : undefined
  );
  const deleteJob = useDeleteJob();
  const statusMutation = useChangeJobStatus();
  const jobs = query.data?.jobs ?? [];

  async function changeJobStatus(jobId: number, status: string) {
    const jobTitle = jobs.find((j) => j.id === jobId)?.title;
    const ok = await confirm(
      confirmJobStatusChange({ nextStatus: status, jobTitle })
    );
    if (!ok) return;
    try {
      await statusMutation.mutateAsync({ jobId, status });
      showAppToast.success("Status updated");
    } catch (error) {
      showAppToast.fromError(error, "Could not update status");
    }
  }

  useEffect(() => {
    if (tab !== "discover" || geo) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        /* optional — suggestions work without device location */
      },
      { maximumAge: 600_000, timeout: 8_000 }
    );
  }, [geo, tab]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage || query.isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void query.fetchNextPage();
      },
      { rootMargin: "240px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  function onTabChange(next: JobsHubTab) {
    setTab(next);
    setSearchInput("");
    setSearch("");
    setPostedStatusFilter("All");
  }

  return (
    <div className="w-full max-w-2xl space-y-4 pb-10">
      <HubControlCard className="sticky top-14 z-30 shadow-sm supports-[backdrop-filter]:bg-card/95 supports-[backdrop-filter]:backdrop-blur-sm">
        <HubControlCardHeader>
          <HubModuleHeader
            title="Jobs"
            action={
              <Button
                asChild
                size="sm"
                className="h-9 rounded-lg px-3 shadow-none"
              >
                <Link href="/jobs/create">Post job</Link>
              </Button>
            }
          />
        </HubControlCardHeader>

        <HubControlCardBody>
          <HubSegmentTabs
            items={JOB_TAB_ITEMS}
            value={tab}
            onChange={onTabChange}
            ariaLabel="Job lists"
            gridClassName="grid-cols-3"
          />

          <HubSearchInput
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => setSearch(searchInput.trim())}
            onClear={() => {
              setSearchInput("");
              setSearch("");
            }}
            placeholder="Search jobs"
          />

          {tab === "posted" ? (
            <JobsHubStatusFilter
              value={postedStatusFilter}
              onChange={setPostedStatusFilter}
            />
          ) : null}
        </HubControlCardBody>
      </HubControlCard>

      {query.isLoading ? <JobsListGridShimmer count={4} /> : null}

      {query.isError ? (
        <ErrorState
          title="Could not load jobs"
          description={jobsErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.isLoading && !query.isError && jobs.length === 0 ? (
        <EmptyState
          title={
            tab === "posted"
              ? "No job posts yet"
              : tab === "applied"
                ? "No applications yet"
                : "No jobs to show"
          }
          description={
            tab === "discover"
              ? "Try another search or check back later for new listings."
              : tab === "posted"
                ? postedStatusFilter === "All"
                  ? "Post a job to start receiving applications."
                  : `No ${postedStatusFilter} job posts match your filters.`
                : "Apply to roles from Discover to track them here."
          }
        />
      ) : null}

      {!query.isLoading && jobs.length > 0 ? (
        <div className="space-y-3">
          <HubTwoColumnGrid>
            {jobs.map((job) => (
              <HubTwoColumnGridItem key={job.id}>
                {tab === "posted" ? (
                  <JobPostedCard
                    job={job}
                    deletePending={deleteJob.isPending}
                    statusChangePending={statusMutation.isPending}
                    onStatusChange={(id, status) => void changeJobStatus(id, status)}
                    onDelete={(id) => {
                      const jobTitle = jobs.find((j) => j.id === id)?.title;
                      void (async () => {
                        const ok = await confirm({
                          ...CONFIRM_DELETE_JOB,
                          detail: jobTitle,
                        });
                        if (!ok) return;
                        try {
                          await deleteJob.mutateAsync(id);
                          showAppToast.success("Job deleted");
                        } catch (error) {
                          showAppToast.fromError(error, "Could not delete job");
                        }
                      })();
                    }}
                  />
                ) : (
                  <JobCard job={job} showStatus={tab === "applied"} />
                )}
              </HubTwoColumnGridItem>
            ))}
          </HubTwoColumnGrid>
          {query.isFetchingNextPage ? (
            <JobsListGridShimmer count={2} />
          ) : null}
          <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        </div>
      ) : null}
    </div>
  );
}
