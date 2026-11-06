"use client";

import { useMemo, useState } from "react";
import {
  DESCRIPTION_COLLAPSED_LINES,
  DESCRIPTION_SEE_MORE_THRESHOLD,
  descriptionNeedsHighlight,
  displayUrl,
  splitDescriptionParts,
} from "@/features/feed/lib/post-description";
import type { PostMention } from "@/features/feed/types/post.types";
import { cn } from "@/lib/utils";

export function PostDescription({
  description,
  mentions = [],
  className,
  compact = false,
}: {
  description: string;
  mentions?: PostMention[];
  className?: string;
  /** Skip outer padding / see-more for comment bodies. */
  compact?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const mentionLabels = useMemo(
    () =>
      mentions
        .map((item) => item.displayName || item.userName)
        .filter((label): label is string => Boolean(label)),
    [mentions]
  );
  const needsHighlight = useMemo(
    () => descriptionNeedsHighlight(description, mentionLabels),
    [description, mentionLabels]
  );
  const parts = useMemo(
    () =>
      needsHighlight
        ? splitDescriptionParts(description, mentionLabels)
        : null,
    [description, mentionLabels, needsHighlight]
  );
  const showToggle =
    !compact && description.length > DESCRIPTION_SEE_MORE_THRESHOLD;

  if (!description) return null;

  function renderParts() {
    if (!needsHighlight || !parts) return description;
    return parts.map((part, index) => {
      if (part.kind === "hashtag") {
        return (
          <span key={`h-${index}`} className="font-semibold text-primary">
            {part.value}
          </span>
        );
      }
      if (part.kind === "url") {
        return (
          <a
            key={`u-${index}`}
            href={part.value}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
            onClick={(e) => e.stopPropagation()}
          >
            {displayUrl(part.value)}
          </a>
        );
      }
      if (part.kind === "email") {
        return (
          <a
            key={`e-${index}`}
            href={`mailto:${part.value}`}
            className="text-primary underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part.value}
          </a>
        );
      }
      if (part.kind === "mention") {
        const mention = mentions.find((item) => {
          const label = item.displayName || item.userName;
          if (!label) return false;
          return (
            part.value.toLowerCase() === label.toLowerCase() ||
            part.value.toLowerCase().includes(label.toLowerCase()) ||
            (item.userName != null &&
              part.value.toLowerCase().includes(`@${item.userName}`))
          );
        });
        const href = mention?.userName
          ? `/u/${mention.userName}`
          : mention?.userId
            ? `/profile/${mention.userId}`
            : undefined;
        if (href) {
          return (
            <a
              key={`m-${index}`}
              href={href}
              className="font-semibold text-sky-500"
              onClick={(e) => e.stopPropagation()}
            >
              {part.value}
            </a>
          );
        }
        return (
          <span key={`m-${index}`} className="font-semibold text-sky-500">
            {part.value}
          </span>
        );
      }
      return <span key={`t-${index}`}>{part.value}</span>;
    });
  }

  return (
    <div className={cn(!compact && "px-4 pt-3", className)}>
      <p
        dir="auto"
        className={cn(
          "locale-text whitespace-pre-wrap leading-relaxed text-foreground",
          compact ? "text-sm" : "text-[15px]",
          collapsed && showToggle && "line-clamp-5"
        )}
        style={
          collapsed && showToggle
            ? { WebkitLineClamp: DESCRIPTION_COLLAPSED_LINES }
            : undefined
        }
      >
        {renderParts()}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="mt-1 text-[15px] font-bold text-primary hover:underline"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? "See More" : "See Less"}
        </button>
      ) : null}
    </div>
  );
}
