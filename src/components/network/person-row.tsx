"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { VerifiedBadgeIcon } from "@/components/profile/profile-badges";
import { formatSuggestionReason } from "@/features/network/lib/format-suggestion-reason";
import type { NetworkPerson } from "@/features/network/types/network.types";

export function PersonRow({
  person,
  actions,
}: {
  person: NetworkPerson;
  actions: ReactNode;
}) {
  const reasonLabel = formatSuggestionReason(person.suggestionReason);

  return (
    <li className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0">
      <Avatar className="h-9 w-9 shrink-0">
        {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
        <AvatarPlaceholderFallback />
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate font-semibold">
          <span className="truncate">{person.name}</span>
          {person.isVerified ? <VerifiedBadgeIcon size={14} /> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[person.role, person.company].filter(Boolean).join(" · ") ||
            (person.userName ? `@${person.userName}` : "Member")}
        </p>
        {reasonLabel ? (
          <p className="truncate text-[11px] text-primary">{reasonLabel}</p>
        ) : null}
        {person.requestMessage ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            “{person.requestMessage}”
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {actions}
      </div>
    </li>
  );
}
