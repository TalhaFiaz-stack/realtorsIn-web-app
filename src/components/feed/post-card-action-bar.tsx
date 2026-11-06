"use client";

import Link from "next/link";
import { MessageCircle, Repeat2, Send } from "lucide-react";
import { useConfirm } from "@/components/common/confirm-provider";
import { PostReactionButton } from "@/components/feed/post-reaction-button";
import { Button } from "@/components/ui/button";
import { CONFIRM_UNDO_REPOST } from "@/constants/confirm-copy";
import type { PostReactionType } from "@/features/feed/constants/post-reactions";
import type { FeedPost } from "@/features/feed/types/post.types";
import { cn } from "@/lib/utils";

export function PostCardActionBar({
  post,
  onLike,
  onComment,
  onRepost,
  onUndoRepost,
  onSend,
  className,
  pickerPortal,
  commentActive,
}: {
  post: FeedPost;
  onLike: (input: {
    reactionType?: PostReactionType | null;
    isTapToggle?: boolean;
  }) => void;
  onComment?: () => void;
  onRepost?: () => void;
  onUndoRepost?: () => void;
  onSend?: () => void;
  className?: string;
  pickerPortal?: boolean;
  commentActive?: boolean;
}) {
  const { confirm } = useConfirm();
  const actionBtnClass =
    "h-10 min-w-0 flex-1 basis-0 gap-1.5 rounded-md px-1 text-[13px] font-semibold text-muted-foreground sm:gap-2 sm:px-2";

  async function handleRepostAction() {
    if (post.isReposted) {
      const ok = await confirm(CONFIRM_UNDO_REPOST);
      if (ok) onUndoRepost?.();
      return;
    }
    onRepost?.();
  }

  return (
    <div className={cn("flex w-full items-stretch py-1", className)}>
      <PostReactionButton
        className="min-w-0 flex-1 basis-0"
        pickerPortal={pickerPortal}
        isLiked={post.isLiked}
        userReaction={post.userReaction}
        onTapToggle={() => onLike({ isTapToggle: true })}
        onSelectReaction={(reactionType) =>
          onLike({ reactionType, isTapToggle: false })
        }
      />

      {onComment ? (
        <Button
          type="button"
          variant="ghost"
          className={cn(actionBtnClass, commentActive && "bg-muted text-foreground")}
          onClick={onComment}
          aria-expanded={commentActive}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span>Comment</span>
        </Button>
      ) : (
        <Button asChild variant="ghost" className={actionBtnClass}>
          <Link href={`/posts/${post.id}`}>
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Comment</span>
          </Link>
        </Button>
      )}

      {!post.isOwn ? (
        <Button
          type="button"
          variant="ghost"
          className={cn(actionBtnClass, post.isReposted && "text-primary")}
          onClick={() => void handleRepostAction()}
          aria-label={post.isReposted ? "Reposted — remove repost" : "Repost"}
        >
          <Repeat2 className="h-4 w-4 shrink-0" />
          <span>{post.isReposted ? "Reposted" : "Repost"}</span>
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        className={actionBtnClass}
        onClick={() => onSend?.()}
        aria-label="Send"
      >
        <Send className="h-4 w-4 shrink-0" />
        <span>Send</span>
      </Button>
    </div>
  );
}
