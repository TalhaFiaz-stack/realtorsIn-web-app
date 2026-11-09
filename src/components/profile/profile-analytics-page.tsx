"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  LineChart,
  MessageCircle,
  PenSquare,
  Search,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DetailMetricGridSkeleton } from "@/components/states/detail-list-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  socialAnalyticsErrorMessage,
  useSocialAnalytics,
} from "@/features/profile/hooks/use-social-analytics";
import type { AnalyticsMetric } from "@/features/profile/types/social-analytics.types";
import { formatAnalyticsPeriod, formatRelativeTime } from "@/lib/format/relative-time";
import { cn } from "@/lib/utils";

type Tone = "blue" | "violet" | "amber" | "emerald";

const TONE: Record<Tone, string> = {
  blue: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
};

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
        className
      )}
    >
      {children}
    </section>
  );
}

function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function DeltaChip({ delta }: { delta: number | null | undefined }) {
  if (delta == null || !Number.isFinite(delta)) return null;
  const up = delta >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        up
          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
          : "bg-rose-500/12 text-rose-700 dark:text-rose-400"
      )}
      title="Change vs. previous 7 days"
    >
      <Icon className="h-3 w-3" aria-hidden />
      {Math.abs(Math.round(delta))}%
    </span>
  );
}

function KpiTile({
  label,
  metric,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  metric: AnalyticsMetric;
  icon: LucideIcon;
  tone: Tone;
  href?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-border/70 bg-background/60 p-3.5 transition-colors",
        href && "group-hover:border-primary/40 group-hover:bg-muted/40"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", TONE[tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {href ? (
          <ChevronRight
            className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
            aria-hidden
          />
        ) : (
          <DeltaChip delta={metric.delta7dPercent} />
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[26px] font-semibold leading-none tabular-nums tracking-tight">
          {metric.value.toLocaleString()}
        </p>
        {href ? <DeltaChip delta={metric.delta7dPercent} /> : null}
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        {metric.period ? formatAnalyticsPeriod(metric.period) : " "}
      </p>
    </div>
  );
  return href ? (
    <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
      {body}
    </Link>
  ) : (
    body
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const done = percent >= 100;
  return (
    <div className="relative h-[88px] w-[88px] shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className={cn("transition-[stroke-dashoffset] duration-500", done ? "stroke-emerald-500" : "stroke-primary")}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold leading-none tabular-nums">{percent}%</span>
        <span className="mt-0.5 text-[10px] text-muted-foreground">of goal</span>
      </span>
    </div>
  );
}

/** Full analytics page (`/me/analytics`). The profile popup keeps the compact view. */
export function ProfileAnalyticsPage() {
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
  const { totalPosts, totalLikesReceived, totalCommentsReceived } = data.contentSummary;
  const avgEngagement =
    totalPosts > 0 ? (totalLikesReceived + totalCommentsReceived) / totalPosts : 0;
  const updatedRaw = data.lastUpdated ? formatRelativeTime(data.lastUpdated) : null;
  // "Just now" → "just now" when it follows "Updated".
  const updated = updatedRaw ? updatedRaw.charAt(0).toLowerCase() + updatedRaw.slice(1) : null;
  const viewers = data.profileViewers.viewers.slice(0, 5);

  const engagement: Array<{ label: string; value: number; icon: LucideIcon; tone: Tone }> = [
    { label: "Posts published", value: totalPosts, icon: FileText, tone: "blue" },
    { label: "Likes received", value: totalLikesReceived, icon: Heart, tone: "violet" },
    { label: "Comments received", value: totalCommentsReceived, icon: MessageCircle, tone: "amber" },
  ];
  const weeklyBreakdown = [
    { label: "Posts", value: weekly.breakdown.posts },
    { label: "Likes", value: weekly.breakdown.likes },
    { label: "Comments", value: weekly.breakdown.comments },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Overview"
          subtitle={updated ? `Updated ${updated}` : "Your reach across RealtorsIn"}
        />
        <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 md:grid-cols-4">
          <KpiTile label="Post impressions" metric={data.postImpressions} icon={LineChart} tone="blue" />
          <KpiTile
            label="Profile viewers"
            metric={data.profileViewers}
            icon={Eye}
            tone="violet"
            href="/me/viewers"
          />
          <KpiTile label="Search appearances" metric={data.searchAppearances} icon={Search} tone="amber" />
          <KpiTile
            label="New connections"
            metric={data.connections}
            icon={Users}
            tone="emerald"
            href="/connections"
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Content & engagement" subtitle="All-time totals for your posts" />
          <ul className="divide-y divide-border/60 px-4 py-2 sm:px-5">
            {engagement.map((row) => (
              <li key={row.label} className="flex items-center gap-3 py-2.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE[row.tone])}>
                  <row.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 text-sm text-foreground">{row.label}</span>
                <span className="text-base font-semibold tabular-nums">{row.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 sm:mx-5">
            <span className="text-xs text-muted-foreground">Avg. engagement per post</span>
            <span className="text-sm font-semibold tabular-nums">
              {avgEngagement.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Weekly sharing goal"
            subtitle={
              progress >= 100
                ? "Goal reached — keep the momentum going"
                : `${Math.max(0, weekly.suggestedActions - weekly.completedActions)} more actions to reach your goal`
            }
            action={
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                <Target className="h-4 w-4" aria-hidden />
              </span>
            }
          />
          <div className="flex items-center gap-5 px-4 pb-4 pt-3 sm:px-5">
            <ProgressRing percent={progress} />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm text-foreground">
                <span className="font-semibold tabular-nums">{weekly.completedActions}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {weekly.completedActions === 1 ? "action" : "actions"} this week · goal{" "}
                  <span className="tabular-nums">{weekly.suggestedActions}</span>
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
                {weeklyBreakdown.map((b) => (
                  <div key={b.label} className="rounded-lg border border-border/70 px-2 py-1.5 text-center">
                    <p className="text-sm font-semibold tabular-nums">{b.value}</p>
                    <p className="text-[11px] text-muted-foreground">{b.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {progress < 100 ? (
            <div className="border-t border-border/60 px-4 py-3 sm:px-5">
              <Button asChild size="sm" className="h-8 rounded-full">
                <Link href="/create">
                  <PenSquare className="h-3.5 w-3.5" aria-hidden />
                  Share an update
                </Link>
              </Button>
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent profile viewers"
          subtitle={formatAnalyticsPeriod(data.profileViewers.period) || null}
          action={
            viewers.length ? (
              <Link
                href="/me/viewers"
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
              >
                See all
                <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
              </Link>
            ) : null
          }
        />
        {viewers.length ? (
          <ul className="divide-y divide-border/60 px-4 py-1.5 sm:px-5">
            {viewers.map((v) => {
              const name = [v.name, v.lastName].filter(Boolean).join(" ") || v.userName || "Member";
              const sub = [v.userRole, v.company].filter(Boolean).join(" · ") || v.location;
              return (
                <li key={v.viewerId}>
                  <Link
                    href={`/profile/${v.viewerId}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-10 w-10">
                      {v.profileImage ? <AvatarImage src={v.profileImage} alt="" /> : null}
                      <AvatarPlaceholderFallback />
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{name}</span>
                      {sub ? <span className="block truncate text-xs text-muted-foreground">{sub}</span> : null}
                    </span>
                    {v.lastViewedAt ? (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelativeTime(v.lastViewedAt)}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 px-4 pb-5 pt-3 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-sm text-muted-foreground">
              No viewers yet. A complete profile and regular posts help people find you.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
