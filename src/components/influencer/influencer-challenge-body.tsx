"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InfluencerBadgeIcon } from "@/components/profile/profile-badges";
import {
  INFLUENCER_CHALLENGE_DESCRIPTION,
  INFLUENCER_CHALLENGE_GUIDE,
} from "@/features/influencer/constants/influencer.constants";
import type { InfluencerStatus } from "@/features/influencer/types/influencer.types";
import { cn } from "@/lib/utils";

type Props = {
  status: InfluencerStatus;
  actionPending?: boolean;
  onPrimaryAction?: () => void;
};

export function InfluencerChallengeBody({
  status,
  actionPending,
  onPrimaryAction,
}: Props) {
  const isEarned =
    status.hasInfluencerBadge || status.challengeStatus === "earned";
  const isInProgress =
    status.challengeStatus === "in_progress" && !isEarned;
  const isExpired = status.challengeStatus === "expired" && !isEarned;
  const ratio = Math.min(
    1,
    status.videoCount / Math.max(status.targetVideos, 1)
  );

  const earnedLabel = status.influencerBadgeEarnedAt
    ? new Date(status.influencerBadgeEarnedAt).toLocaleDateString()
    : null;

  let statusLabel = "Not started";
  let primaryLabel: string | null = "Start challenge";
  let primaryHref: string | null = null;

  if (isEarned) {
    statusLabel = earnedLabel ? `Earned ${earnedLabel}` : "Badge earned";
    primaryLabel = null;
  } else if (isInProgress) {
    statusLabel = `${status.daysRemaining} days remaining`;
    primaryLabel = "Post a video";
    primaryHref = "/create";
  } else if (isExpired) {
    statusLabel = "Challenge ended — start again anytime";
    primaryLabel = "Start new challenge";
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        <InfluencerBadgeIcon size={48} />
        <h2 className="mt-4 text-xl font-semibold">
          {isEarned ? "Influencer Badge" : "Influencer Challenge"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{statusLabel}</p>
        {!isEarned ? (
          <>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <StatBox
                value={`${status.videoCount}/${status.targetVideos}`}
                label="Videos"
              />
              <StatBox
                value={
                  isInProgress
                    ? String(status.daysRemaining)
                    : String(status.windowDays)
                }
                label={isInProgress ? "Days left" : "Day window"}
              />
              <StatBox value={String(status.dailyCap)} label="Daily cap" />
            </div>
            {isInProgress ? (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              {status.progressText}
            </p>
          </>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">About</h3>
        <p className="text-sm text-muted-foreground">
          {INFLUENCER_CHALLENGE_DESCRIPTION}
        </p>
        <ul className="space-y-2">
          {INFLUENCER_CHALLENGE_GUIDE.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {primaryLabel ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          {primaryHref ? (
            <Button asChild className="w-full md:w-auto" size="lg">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full md:w-auto"
              size="lg"
              disabled={actionPending}
              onClick={onPrimaryAction}
            >
              {actionPending ? "Please wait…" : primaryLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className={cn("rounded-md bg-muted/60 px-2 py-3")}>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
