"use client";

import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { OffPlanDetailInfoCard } from "@/components/listings/off-plan-detail/off-plan-detail-info-card";
import { OffPlanHtmlDescription } from "@/components/listings/off-plan-detail/off-plan-html-description";
import { OffPlanProjectCard } from "@/components/listings/off-plan-project-card";
import { OffPlanProjectGridSkeleton } from "@/components/listings/off-plan-skeletons";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { fetchOffPlanProjectsClient } from "@/features/off-plan/services/off-plan.client";

export type OffPlanDeveloperPageProps = {
  developerId: number;
  name: string | null;
  image: string | null;
  description: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  workingTime: string | null;
  typeLabel: string | null;
};

function capitalizeType(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function OffPlanDeveloperPage(props: OffPlanDeveloperPageProps) {
  const displayName = props.name ?? "Developer";
  const subtitle = props.typeLabel
    ? capitalizeType(props.typeLabel)
    : "Developer";

  const listQuery = useInfiniteQuery({
    queryKey: ["off-plan", "developer-projects", props.developerId],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchOffPlanProjectsClient(
        {
          page: pageParam,
          developerIds: [String(props.developerId)],
        },
        signal
      ),
    getNextPageParam: (last) =>
      last.hasMore ? last.currentPage + 1 : undefined,
  });

  const projects =
    listQuery.data?.pages.flatMap((p) => p.projects ?? []) ?? [];

  return (
    <div className="pb-16">
      <div className="relative mx-auto max-w-4xl px-4 pt-4 md:px-6 md:pt-6">
        <Link
          href="/listings?tab=off-plan"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to listings
        </Link>

        <div className="flex flex-col items-center pb-6 pt-2 text-center">
          {props.image ? (
            <RemoteImg
              src={props.image}
              alt=""
              wrapperClassName="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted shadow-sm"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-xs text-muted-foreground">
              No image
            </div>
          )}
          <h1 className="locale-text mt-4 text-xl font-semibold md:text-2xl">
            {displayName}
          </h1>
          <p className="mt-1 text-base font-semibold text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {(props.description || props.name) && props.description ? (
            <section>
              <h2 className="locale-text mb-3 px-1 text-base font-bold">
                {`About ${displayName}`}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
                <OffPlanHtmlDescription html={props.description} />
              </div>
            </section>
          ) : null}

          <OffPlanDetailInfoCard
            website={props.website}
            email={props.email}
            address={props.address}
            workingTime={props.workingTime}
          />

          <section>
            <h2 className="locale-text mb-3 px-1 text-sm font-bold">
              {`Other projects by ${displayName}`}
            </h2>

            {listQuery.isLoading ? (
              <OffPlanProjectGridSkeleton
                count={2}
                columns="sm:grid-cols-2"
              />
            ) : null}

            {listQuery.isError ? (
              <ErrorState
                title="Unable to load projects"
                onRetry={() => listQuery.refetch()}
              />
            ) : null}

            {!listQuery.isLoading && !listQuery.isError && projects.length === 0 ? (
              <EmptyState
                title="No other projects"
                description="This developer has no listed projects yet."
              />
            ) : null}

            {projects.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <OffPlanProjectCard project={p} />
                  </li>
                ))}
              </ul>
            ) : null}

            {listQuery.hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={listQuery.isFetchingNextPage}
                  onClick={() => listQuery.fetchNextPage()}
                >
                  {listQuery.isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
