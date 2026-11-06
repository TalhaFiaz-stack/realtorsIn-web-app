"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ReferralHistoryItem } from "@/features/referral/types/referral.types";
import { cn } from "@/lib/utils";

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "invalid") return "outline";
  return "secondary";
}

export function ReferralHistoryItemRow({ item }: { item: ReferralHistoryItem }) {
  const user = item.referredUser;
  const disabled = user.isDeleted || item.isDeleted;

  const inner = (
    <>
      <Avatar className="h-10 w-10 shrink-0">
        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
        <AvatarPlaceholderFallback />
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold">{user.shortName}</p>
          <Badge variant={statusVariant(item.status)} className="text-[10px]">
            {item.statusLabel}
          </Badge>
        </div>
        {user.userName && !disabled ? (
          <p className="truncate text-xs text-muted-foreground">
            @{user.userName}
          </p>
        ) : null}
        {!item.progress.allComplete && item.progress.steps.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.progress.steps.map((step) => (
              <li
                key={step.key}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  step.done
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  if (disabled || !user.userId) {
    return (
      <li className="flex gap-3 border-b border-border py-3 last:border-b-0 opacity-70">
        {inner}
      </li>
    );
  }

  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <Link
        href={`/profile/${user.userId}`}
        className="flex gap-3 rounded-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {inner}
      </Link>
    </li>
  );
}
