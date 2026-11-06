"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OffPlanDetailPageSkeleton } from "@/components/listings/off-plan-skeletons";
import { ErrorState } from "@/components/states/error-state";
import { OffPlanCommercialDialog } from "@/components/listings/off-plan-detail/off-plan-commercial-dialog";
import type { OffPlanCommercialSheetKind } from "@/components/listings/off-plan-detail/off-plan-commercial-dialog";
import { OffPlanDetailFooter } from "@/components/listings/off-plan-detail/off-plan-detail-footer";
import { OffPlanDetailHero } from "@/components/listings/off-plan-detail/off-plan-detail-hero";
import { OffPlanDetailSections } from "@/components/listings/off-plan-detail/off-plan-detail-sections";
import { OffPlanDetailTabBar } from "@/components/listings/off-plan-detail/off-plan-detail-tab-bar";
import { ShellBackLink } from "@/components/navigation/shell-back-link";
import { ShellBackRow } from "@/components/navigation/shell-back-row";
import { buildOffPlanDetailTabs } from "@/features/off-plan/lib/build-detail-tabs";
import { useOffPlanDetailScrollTabs } from "@/features/off-plan/hooks/use-off-plan-detail-scroll-tabs";
import { useTrackOffPlanView } from "@/features/off-plan/hooks/use-track-off-plan-view";
import { fetchOffPlanProjectDetailClient } from "@/features/off-plan/services/off-plan.client";

const LISTINGS_OFF_PLAN_HREF = "/listings?tab=off-plan";

export function OffPlanDetailPage({ projectId }: { projectId: string }) {
  const query = useQuery({
    queryKey: ["off-plan", "detail", projectId],
    queryFn: ({ signal }) => fetchOffPlanProjectDetailClient(projectId, signal),
  });

  const project = query.data?.project;
  const tabs = useMemo(
    () => (project ? buildOffPlanDetailTabs(project) : []),
    [project]
  );
  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs]);

  const scrollTabs = useOffPlanDetailScrollTabs({
    tabs: tabIds,
    enabled: Boolean(project),
  });

  // Mobile parity: trackEvents('project_detail_open') + recordAnalyticsApi('project_view').
  useTrackOffPlanView(
    project
      ? {
          projectId: project.id,
          projectName: project.title,
          eventType: "project_detail_open",
          analyticsAction: "project_view",
        }
      : null,
    Boolean(project)
  );

  const [commercialKind, setCommercialKind] =
    useState<OffPlanCommercialSheetKind | null>(null);

  if (query.isLoading) {
    return <OffPlanDetailPageSkeleton />;
  }

  if (query.isError || !project) {
    return (
      <div className="w-full max-w-4xl space-y-4 pb-10">
        <ShellBackRow className="justify-end">
          <ShellBackLink href={LISTINGS_OFF_PLAN_HREF} label="Listings" />
        </ShellBackRow>
        <ErrorState
          title="Unable to load project"
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="relative z-0 w-full max-w-4xl space-y-4 pb-24 md:pb-10">
      <ShellBackRow className="justify-end">
        <ShellBackLink href={LISTINGS_OFF_PLAN_HREF} label="Listings" />
      </ShellBackRow>

      <OffPlanDetailHero project={project} />

      <div
        ref={scrollTabs.tabsAnchorRef}
        className={
          scrollTabs.tabsPinned
            ? "pointer-events-none invisible"
            : "relative z-20 bg-card/80"
        }
        aria-hidden={scrollTabs.tabsPinned}
      >
        <OffPlanDetailTabBar
          tabs={tabIds}
          activeTab={scrollTabs.activeTab}
          scrollRef={scrollTabs.inlineTabBarScrollRef}
          onSelect={scrollTabs.selectTab}
        />
      </div>

      {scrollTabs.tabsPinned ? (
        <div className="fixed inset-x-0 top-14 z-50 border-b border-border/60 bg-card/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
          <div className="mx-auto flex w-full max-w-[var(--shell-max)] px-3 md:px-4">
            <div className="w-full max-w-4xl">
              <OffPlanDetailTabBar
                tabs={tabIds}
                activeTab={scrollTabs.activeTab}
                scrollRef={scrollTabs.pinnedTabBarScrollRef}
                onSelect={scrollTabs.selectTab}
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 pb-4 pt-1">
        <OffPlanDetailSections
          project={project}
          onOpenCommercial={setCommercialKind}
        />
      </div>

      <OffPlanDetailFooter project={project} />

      <OffPlanCommercialDialog
        open={commercialKind != null}
        kind={commercialKind}
        project={project}
        onOpenChange={(open) => {
          if (!open) setCommercialKind(null);
        }}
      />
    </div>
  );
}
