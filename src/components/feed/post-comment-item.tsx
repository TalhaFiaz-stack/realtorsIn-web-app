"use client";

import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/common/confirm-provider";
import { PostDescription } from "@/components/feed/post-description";
import { PostReactionButton } from "@/components/feed/post-reaction-button";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  formatPostLikeSummary,
  getSummaryReactionTypes,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import { formatRelativeTime } from "@/features/feed/lib/map-post";
import type { PostComment } from "@/features/feed/types/post.types";
import { CONFIRM_DELETE_COMMENT } from "@/constants/confirm-copy";

export function PostCommentItem({
  comment,
  deleting,
  pickerPortal = true,
  onReact,
  onDelete,
}: {
  comment: PostComment;
  deleting?: boolean;
  /** Portal picker — required for scrollable comment lists. */
  pickerPortal?: boolean;
  onReact: (input: {
    commentId: number;
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  }) => void;
  onDelete?: (commentId: number) => void;
}) {
  const { confirm } = useConfirm();
  const summaryTypes = getSummaryReactionTypes({
    reactionSummary: comment.reactionSummary,
    likeStatus: comment.isLiked,
    userReaction: comment.userReaction,
    likeCount: comment.likeCount,
  });
  const likeSummary = formatPostLikeSummary({
    likeCount: comment.likeCount,
    likeStatus: comment.isLiked,
    summaryReactionTypes: summaryTypes,
  });
  /** Button already shows your reaction label — skip redundant "You" beside it. */
  const showInlineLikeSummary =
    Boolean(likeSummary) &&
    !(comment.isLiked && (comment.likeCount ?? 0) === 1);

  return (
    <li className="flex gap-2.5">
      <Avatar className="h-9 w-9 shrink-0">
        {comment.avatarUrl ? (
          <AvatarImage src={comment.avatarUrl} alt="" />
        ) : null}
        <AvatarPlaceholderFallback />
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-muted/60 px-3 py-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-foreground">
              {comment.authorName}
            </span>
            {comment.createdAt ? (
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>
            ) : null}
            {comment.isOwn ? (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                You
              </span>
            ) : null}
          </div>
          <PostDescription
            description={comment.comment}
            mentions={comment.mentions}
            compact
            className="mt-0.5"
          />
        </div>

        <div className="relative mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 overflow-visible pl-1">
          <PostReactionButton
            className="w-auto shrink-0 justify-start [&_button]:h-8 [&_button]:w-auto [&_button]:justify-start [&_button]:px-2"
            pickerPortal={pickerPortal}
            enableHoverPicker
            pickerAlign="start"
            compact
            isLiked={comment.isLiked}
            userReaction={comment.userReaction}
            onTapToggle={() =>
              onReact({ commentId: comment.id, isTapToggle: true })
            }
            onSelectReaction={(reactionType) =>
              onReact({
                commentId: comment.id,
                reactionType,
                isTapToggle: false,
              })
            }
          />
          {showInlineLikeSummary ? (
            <span className="text-xs font-semibold text-muted-foreground">
              {likeSummary}
            </span>
          ) : null}
          {comment.isOwn && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              disabled={deleting}
              onClick={() => {
                void (async () => {
                  const ok = await confirm(CONFIRM_DELETE_COMMENT);
                  if (ok) onDelete(comment.id);
                })();
              }}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
