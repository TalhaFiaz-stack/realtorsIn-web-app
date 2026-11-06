"use client";

import Link from "next/link";
import { DetailMetricGridSkeleton } from "@/components/states/detail-list-skeleton";
import { ErrorState } from "@/components/states/error-state";
import { Button } from "@/components/ui/button";
import {
  socialAnalyticsErrorMessage,
  useSocialAnalytics,
} from "@/features/profile/hooks/use-social-analytics";
import { formatAnalyticsPeriod } from "@/lib/format/relative-time";

function MetricCard({
  label,
  value,
  period,
  href,
}: {
  label: string;
  value: number;
  period: string | null;
  href?: string;
}) {
  const body = (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      {period ? (
        <p className="text-xs text-muted-foreground">
          {formatAnalyticsPeriod(period)}
        </p>
      ) : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

export function ProfileAnalyticsDetailScreen() {
  const query = useSocialAnalytics();

  if (query.isLoading) {
    return <DetailMetricGridSkeleton count={4} />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Analytics unavailable"
        description={socialAnalyticsErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Post impressions"
          value={data.postImpressions.value}
          period={data.postImpressions.period}
        />
        <MetricCard
          label="Profile viewers"
          value={data.profileViewers.value}
          period={data.profileViewers.period}
          href="/me/viewers"
        />
        <MetricCard
          label="Search appearances"
          value={data.searchAppearances.value}
          period={data.searchAppearances.period}
        />
        <MetricCard
          label="New connections"
          value={data.connections.value}
          period={data.connections.period}
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Content summary</h2>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <dt className="text-muted-foreground">Posts</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {data.contentSummary.totalPosts}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Likes received</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {data.contentSummary.totalLikesReceived}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Comments received</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {data.contentSummary.totalCommentsReceived}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold">Weekly sharing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.weeklySharing.completedActions} of{" "}
          {data.weeklySharing.suggestedActions} suggested actions completed
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Posts {data.weeklySharing.breakdown.posts} · Likes{" "}
          {data.weeklySharing.breakdown.likes} · Comments{" "}
          {data.weeklySharing.breakdown.comments}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/me/viewers">View profile viewers</Link>
        </Button>
      </section>
    </div>
  );
}
