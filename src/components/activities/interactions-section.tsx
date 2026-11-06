"use client";

import {
  ACTIVITY_HUB_ITEMS,
  PROPERTY_HUB_ACTIVITY,
  SCHEDULED_ACTIVITY_HUB,
} from "@/features/activities/constants/activity-hub-items";
import { fetchScheduledPostsRequest } from "@/features/feed/services/scheduled-posts.client";
import {
  activityErrorMessage,
  useActivitySummary,
} from "@/features/activities/hooks/use-activities";
import { ActivityHubCard } from "@/components/activities/activity-hub-card";
import { ActivityHubShimmer } from "@/components/activities/activity-shimmers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

type Props = {
  /** When false, only cards render (e.g. embedded in a page that has its own title). */
  showHeader?: boolean;
  className?: string;
};

export function InteractionsSection({
  showHeader = true,
  className,
}: Props) {
  const { data: summary, isLoading, isError, error, refetch } =
    useActivitySummary();
  const scheduledQuery = useQuery({
    queryKey: ["posts", "scheduled", "count"],
    queryFn: ({ signal }) => fetchScheduledPostsRequest({ page: 1, limit: 1, signal }),
    staleTime: 60_000,
  });
  const scheduledCount = scheduledQuery.data?.total ?? 0;

  return (
    <section className={cn(className)} aria-label="Interactions">
      {showHeader ? (
        <header className="mb-2.5 px-0.5">
          <h2 className="text-[17px] font-bold leading-tight text-foreground">
            Interactions
          </h2>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            Manage your social activity
          </p>
        </header>
      ) : null}

      {isLoading ? (
        <ActivityHubShimmer count={4} />
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {activityErrorMessage(error)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-8 text-xs"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <ActivityHubCard
            href={PROPERTY_HUB_ACTIVITY.href}
            title={PROPERTY_HUB_ACTIVITY.title}
            subtitle={PROPERTY_HUB_ACTIVITY.subtitle}
            icon={PROPERTY_HUB_ACTIVITY.icon}
            count={0}
            iconWrapClassName={PROPERTY_HUB_ACTIVITY.iconWrapClassName}
            iconClassName={PROPERTY_HUB_ACTIVITY.iconClassName}
          />
          <ActivityHubCard
            href={SCHEDULED_ACTIVITY_HUB.href}
            title={SCHEDULED_ACTIVITY_HUB.title}
            subtitle={SCHEDULED_ACTIVITY_HUB.subtitle}
            icon={SCHEDULED_ACTIVITY_HUB.icon}
            count={scheduledCount}
            iconWrapClassName={SCHEDULED_ACTIVITY_HUB.iconWrapClassName}
            iconClassName={SCHEDULED_ACTIVITY_HUB.iconClassName}
          />
          {ACTIVITY_HUB_ITEMS.map((item) => (
            <ActivityHubCard
              key={item.href}
              href={item.href}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              count={summary?.[item.countKey] ?? 0}
              iconWrapClassName={item.iconWrapClassName}
              iconClassName={item.iconClassName}
            />
          ))}
        </div>
      )}
    </section>
  );
}
