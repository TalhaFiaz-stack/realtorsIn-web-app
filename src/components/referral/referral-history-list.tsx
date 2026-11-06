"use client";

import { ReferralHistoryItemRow } from "@/components/referral/referral-history-item";
import { ReferralHistoryListSkeleton } from "@/components/referral/referral-history-list-skeleton";
import type { ReferralHistoryItem } from "@/features/referral/types/referral.types";

export function ReferralHistoryList({
  referrals,
  loading,
  hasBadge,
}: {
  referrals: ReferralHistoryItem[];
  loading: boolean;
  hasBadge: boolean;
}) {
  return (
    <section className="mt-6 space-y-3">
      <header>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">My referrals</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-primary">
            {referrals.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasBadge
            ? "People who joined with your code"
            : "Track each friend's signup progress"}
        </p>
      </header>

      {loading ? (
        <ReferralHistoryListSkeleton count={2} />
      ) : referrals.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-4 py-8 text-center shadow-sm">
          <p className="text-sm font-semibold">No referrals yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When friends use your code, their signup progress will show here.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-card px-3 shadow-sm">
          {referrals.map((item) => (
            <ReferralHistoryItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
