"use client";

import { PostReactionIcon } from "@/features/feed/constants/post-reaction-icons";
import {
  getPostReactionMeta,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import { cn } from "@/lib/utils";

export function PostReactionSummaryRow({
  summaryTypes,
  likeSummary,
  onClick,
  className,
}: {
  summaryTypes: PostReactionType[];
  likeSummary: string | null;
  onClick?: () => void;
  className?: string;
}) {
  if (!likeSummary) return null;

  const badgeSize = 20;
  const iconSize = 14;
  const badgeOverlap = 6;
  const badgeStackWidth =
    summaryTypes.length > 0
      ? badgeSize + (summaryTypes.length - 1) * (badgeSize - badgeOverlap)
      : 0;

  const badges =
    summaryTypes.length > 0 ? (
      <span
        className="relative inline-flex shrink-0 isolate items-center"
        style={{ width: badgeStackWidth, height: badgeSize }}
      >
        {summaryTypes.map((type, index) => {
          const meta = getPostReactionMeta(type);
          return (
            <span
              key={`${type}-${index}`}
              className="absolute top-0 inline-flex items-center justify-center overflow-hidden rounded-full bg-card ring-1 ring-border"
              style={{
                width: badgeSize,
                height: badgeSize,
                left: index * (badgeSize - badgeOverlap),
                zIndex: summaryTypes.length - index,
              }}
              title={meta?.label}
            >
              <PostReactionIcon type={type} size={iconSize} />
            </span>
          );
        })}
      </span>
    ) : null;

  const label = (
    <span className="truncate text-[13px] leading-5 tabular-nums text-muted-foreground underline decoration-transparent decoration-1 underline-offset-2 transition-colors group-hover:decoration-muted-foreground group-hover:text-foreground">
      {likeSummary}
    </span>
  );

  const rowClass = cn(
    "group inline-flex h-5 min-w-0 max-w-full items-center gap-1.5",
    className
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          rowClass,
          "locale-text min-w-0 max-w-full shrink rounded-sm text-start"
        )}
        onClick={onClick}
      >
        {badges}
        {label}
      </button>
    );
  }

  return (
    <span className={rowClass}>
      {badges}
      {label}
    </span>
  );
}
