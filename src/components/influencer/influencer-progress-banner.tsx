"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InfluencerBadgeIcon } from "@/components/profile/profile-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfluencerStatus } from "@/features/influencer/hooks/use-influencer";

export function InfluencerProgressBanner() {
  const { data: status, isLoading } = useInfluencerStatus();

  if (isLoading && !status) {
    return (
      <Skeleton className="mb-3 h-[4.5rem] w-full rounded-xl" aria-hidden />
    );
  }

  if (!status?.featureEnabled || status.hasInfluencerBadge) {
    return null;
  }

  const inProgress = status.challengeStatus === "in_progress";
  const subtitle = inProgress
    ? `${status.videoCount}/${status.targetVideos} videos · ${status.daysRemaining} days left`
    : status.progressText;

  return (
    <Link
      href="/growth/influencer"
      className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 shadow-sm transition-colors hover:bg-muted/40"
    >
      <InfluencerBadgeIcon size={32} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">Influencer Challenge</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
