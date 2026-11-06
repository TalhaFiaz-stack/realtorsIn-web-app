"use client";

import Link from "next/link";
import { DetailListCardSkeleton } from "@/components/states/detail-list-skeleton";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  socialAnalyticsErrorMessage,
  useSocialAnalytics,
} from "@/features/profile/hooks/use-social-analytics";
import {
  formatAnalyticsPeriod,
  formatRelativeTime,
} from "@/lib/format/relative-time";

function displayName(input: {
  name: string | null;
  lastName: string | null;
  userName: string | null;
}) {
  const full = [input.name, input.lastName].filter(Boolean).join(" ");
  return full || input.userName || "Member";
}

export function ProfileViewersScreen() {
  const query = useSocialAnalytics();

  if (query.isLoading) {
    return (
      <DetailListCardSkeleton rows={5} ariaLabel="Loading profile viewers" />
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Could not load viewers"
        description={socialAnalyticsErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const viewers = query.data.profileViewers.viewers;
  const period = formatAnalyticsPeriod(query.data.profileViewers.period);

  if (viewers.length === 0) {
    return (
      <EmptyState
        title="No profile viewers yet"
        description="When people view your profile, they will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {viewers.length} viewer{viewers.length === 1 ? "" : "s"}
        {period ? ` · ${period}` : ""}
      </p>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {viewers.map((viewer) => {
          const name = displayName(viewer);
          const profileHref = viewer.userName
            ? `/u/${encodeURIComponent(viewer.userName)}`
            : `/profile/${viewer.viewerId}`;
          return (
            <li key={viewer.viewerId}>
              <Link
                href={profileHref}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
              >
                {viewer.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewer.profileImage}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {name}
                  </span>
                  {viewer.company ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {viewer.company}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(viewer.lastViewedAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
