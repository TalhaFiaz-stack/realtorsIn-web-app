"use client";

import { Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Gradient ring when the user has active stories (feed + left rail). */
export function StoryAvatarRing({
  children,
  hasUnseen = true,
  className,
}: {
  children: React.ReactNode;
  hasUnseen?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full p-[2px]",
        hasUnseen
          ? "bg-gradient-to-br from-[#2BA6E6] via-[#0F6BB0] to-[#112F6B]"
          : "bg-[#C7CBD1]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function StoryAvatar({
  name,
  avatarUrl,
  hasUnseen,
  isCreate = false,
  onClick,
}: {
  name: string;
  avatarUrl?: string | null;
  hasUnseen?: boolean;
  isCreate?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center"
      aria-label={isCreate ? "Create story" : `View ${name}'s story`}
    >
      {isCreate ? (
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-transparent">
          <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-[#E7F3FF] text-primary">
            <Plus className="h-7 w-7 stroke-[2.5]" aria-hidden />
          </span>
        </span>
      ) : (
        <StoryAvatarRing hasUnseen={hasUnseen} className="h-14 w-14">
          <Avatar className="h-full w-full border-2 border-card">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarPlaceholderFallback />
          </Avatar>
        </StoryAvatarRing>
      )}
      <span className="w-full truncate text-[12px] font-medium text-foreground">
        {isCreate ? "Create story" : name}
      </span>
    </button>
  );
}
