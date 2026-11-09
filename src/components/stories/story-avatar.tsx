"use client";

import { useId } from "react";
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

/**
 * Story ring (feed rail, left rail, profile). Like mobile, it is split into one
 * arc per story: unseen arcs use the brand gradient, seen arcs are grey.
 * Pass `stories` for the segmented ring; otherwise a single ring is drawn.
 */
export function StoryAvatarRing({
  children,
  hasUnseen = true,
  stories,
  className,
}: {
  children: React.ReactNode;
  hasUnseen?: boolean;
  /** One entry per story (in order); `hasViewed` picks the arc colour. */
  stories?: ReadonlyArray<{ hasViewed: boolean }>;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const segments =
    stories && stories.length > 0 ? stories.map((s) => !s.hasViewed) : [hasUnseen];
  const count = Math.min(segments.length, 30);
  const r = 47;
  const circumference = 2 * Math.PI * r;
  // Gap between arcs scales down as the count grows so short arcs stay visible.
  const gap = count > 1 ? Math.min(7, (circumference / count) * 0.28) : 0;
  const arc = circumference / count - gap;

  return (
    <span className={cn("relative inline-flex items-center justify-center rounded-full p-[3px]", className)}>
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2BA6E6" />
            <stop offset="55%" stopColor="#0F6BB0" />
            <stop offset="100%" stopColor="#112F6B" />
          </linearGradient>
        </defs>
        {segments.slice(0, count).map((unseen, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth={unseen ? 4 : 3}
            strokeLinecap={count > 1 ? "round" : "butt"}
            stroke={unseen ? `url(#${gradientId})` : "currentColor"}
            className={unseen ? undefined : "text-[#C7CBD1] dark:text-muted-foreground/50"}
            strokeDasharray={`${arc} ${circumference - arc}`}
            strokeDashoffset={-(i * (circumference / count) + gap / 2)}
          />
        ))}
      </svg>
      {children}
    </span>
  );
}

export function StoryAvatar({
  name,
  avatarUrl,
  hasUnseen,
  stories,
  isCreate = false,
  onClick,
}: {
  name: string;
  avatarUrl?: string | null;
  hasUnseen?: boolean;
  stories?: ReadonlyArray<{ hasViewed: boolean }>;
  isCreate?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center"
      aria-label={
        isCreate ? "Create story" : name === "Your story" ? "View your story" : `View ${name}'s story`
      }
    >
      {isCreate ? (
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-transparent">
          <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-7 w-7 stroke-[2.5]" aria-hidden />
          </span>
        </span>
      ) : (
        <StoryAvatarRing hasUnseen={hasUnseen} stories={stories} className="h-14 w-14">
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
