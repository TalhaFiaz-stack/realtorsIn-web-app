"use client";

import { Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectorBadgeIcon } from "@/components/profile/profile-badges";
import type { ReferralStatus } from "@/features/referral/types/referral.types";
import { cn } from "@/lib/utils";

type Props = {
  status: ReferralStatus;
  onCopy: () => void;
  onShare: () => void;
  copyPending?: boolean;
  sharePending?: boolean;
};

export function ReferralInvitePanel({
  status,
  onCopy,
  onShare,
  copyPending,
  sharePending,
}: Props) {
  const target = Math.max(status.referralTarget || 2, 1);
  const count = Math.min(Math.max(status.referralCount, 0), target);
  const remaining = Math.max(target - count, 0);

  if (!status.canRefer) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-3">
          <ConnectorBadgeIcon size={28} />
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold">
              Complete your profile to invite
            </h2>
            <p className="text-sm text-muted-foreground">
              Verify your phone and email, and finish your profile before you can
              refer friends and earn the Connector Badge.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <ConnectorBadgeIcon size={28} />
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold">
            {status.hasConnectorBadge
              ? "Connector Badge earned"
              : "Earn your Connector Badge"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {status.hasConnectorBadge
              ? "You can browse and connect with verified brokers below."
              : `Refer ${target} broker friends. ${count} of ${target} complete so far.`}
          </p>
        </div>
      </div>

      {!status.hasConnectorBadge ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: target }).map((_, index) => {
              const filled = index < count;
              return (
                <div key={index} className="space-y-1">
                  <div
                    className={cn(
                      "h-1.5 rounded-full bg-muted",
                      filled && "bg-primary"
                    )}
                  />
                  <p
                    className={cn(
                      "text-xs text-muted-foreground",
                      filled && "font-medium text-foreground"
                    )}
                  >
                    {filled ? "Joined" : `Friend ${index + 1}`}
                  </p>
                </div>
              );
            })}
          </div>
          {remaining > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Invite {remaining} more{" "}
              {remaining === 1 ? "friend" : "friends"} to unlock the verified
              broker directory.
            </p>
          ) : null}
        </>
      ) : null}

      <div className="my-4 h-px bg-border" />

      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Your referral code
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-muted px-3 py-2 text-lg font-semibold tracking-wider">
          {status.referralCode ?? "—"}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!status.referralCode || copyPending}
          onClick={onCopy}
          className="gap-1.5"
        >
          <Copy className="h-4 w-4" aria-hidden />
          Copy
        </Button>
      </div>

      <Button
        type="button"
        className="mt-3 w-full gap-2 sm:w-auto"
        disabled={!status.referralCode || sharePending}
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        Share invite
      </Button>
    </section>
  );
}
