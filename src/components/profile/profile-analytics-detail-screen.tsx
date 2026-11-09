"use client";

import Link from "next/link";
import {
  ChevronRight,
  Eye,
  FileText,
  Heart,
  LineChart,
  MessageCircle,
  Search,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DetailMetricGridSkeleton } from "@/components/states/detail-list-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  socialAnalyticsErrorMessage,
  useSocialAnalytics,
} from "@/features/profile/hooks/use-social-analytics";
import { formatAnalyticsPeriod } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";

function MetricTile({
  label,
  value,
  period,
  icon: Icon,
  href,
  onNavigate,
}: {
  label: string;
  value: number;
  period: string | null;
  icon: LucideIcon;
  href?: string;
  onNavigate?: () => void;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border/70 bg-background p-4 transition-colors",
        href && "group-hover:border-primary/40 group-hover:bg-muted/30"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {href ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {period ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{formatAnalyticsPeriod(period)}</p>
      ) : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="group block" onClick={onNavigate}>
        {body}
      </Link>
    );
  }
  return body;
}

/** Analytics body — used by the profile popup and the /me/analytics page. */
export function ProfileAnalyticsDetailScreen({
  onNavigate,
}: {
  /** Called when a link inside is followed (popup closes itself). */
  onNavigate?: () => void;
} = {}) {
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
  const weekly = data.weeklySharing;
  const progress =
    weekly.suggestedActions > 0
      ? Math.min(100, Math.round((weekly.completedActions / weekly.suggestedActions) * 100))
      : 0;

  const summary = [
    { label: "Posts", value: data.contentSummary.totalPosts, icon: FileText },
    { label: "Likes received", value: data.contentSummary.totalLikesReceived, icon: Heart },
    { label: "Comments received", value: data.contentSummary.totalCommentsReceived, icon: MessageCircle },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <MetricTile
          label="Post impressions"
          value={data.postImpressions.value}
          period={data.postImpressions.period}
          icon={LineChart}
        />
        <MetricTile
          label="Profile viewers"
          value={data.profileViewers.value}
          period={data.profileViewers.period}
          icon={Eye}
          href="/me/viewers"
          onNavigate={onNavigate}
        />
        <MetricTile
          label="Search appearances"
          value={data.searchAppearances.value}
          period={data.searchAppearances.period}
          icon={Search}
        />
        <MetricTile
          label="New connections"
          value={data.connections.value}
          period={data.connections.period}
          icon={Users}
          href="/connections"
          onNavigate={onNavigate}
        />
      </div>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Content summary
        </h3>
        <div className="grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-background">
          {summary.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 px-2 py-3.5 text-center">
              <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-lg font-semibold tabular-nums">{item.value.toLocaleString()}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/70 bg-background p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Target className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">Weekly sharing goal</h3>
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums",
                  progress >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
              >
                {progress >= 100
                  ? `Goal reached · ${weekly.completedActions} actions`
                  : `${weekly.completedActions}/${weekly.suggestedActions} actions`}
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Weekly sharing progress"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {weekly.breakdown.posts} posts · {weekly.breakdown.likes} likes ·{" "}
              {weekly.breakdown.comments} comments this week
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
