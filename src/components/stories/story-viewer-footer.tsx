"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_STORY_REPLY_LENGTH } from "@/features/stories/constants/story.constants";
import {
  storiesErrorMessage,
  useReactToStory,
  useStoryReply,
} from "@/features/stories/hooks/use-stories";
import type { StoryItem, StoryUserGroup } from "@/features/stories/types/story.types";
import { cn } from "@/lib/utils";

export function StoryViewerFooter({
  story,
  group,
  onPause,
  onResume,
  onOpenViewers,
}: {
  story: StoryItem;
  group: StoryUserGroup;
  onPause: () => void;
  onResume: () => void;
  onOpenViewers: () => void;
}) {
  const react = useReactToStory();
  const reply = useStoryReply();
  const [reacted, setReacted] = useState(story.hasReacted);
  const [replyText, setReplyText] = useState("");
  const [replyFocused, setReplyFocused] = useState(false);

  useEffect(() => {
    setReacted(story.hasReacted);
    setReplyText("");
    setReplyFocused(false);
  }, [story.id, story.hasReacted]);

  async function handleReact() {
    if (story.isOwn || react.isPending) return;
    const previous = reacted;
    setReacted(!previous);
    try {
      const result = await react.mutateAsync({ storyId: story.id });
      setReacted(result.reacted);
    } catch (err) {
      setReacted(previous);
      window.alert(storiesErrorMessage(err));
    }
  }

  async function handleSendReply() {
    const trimmed = replyText.trim();
    if (!trimmed || reply.isPending || story.isOwn) return;
    onPause();
    try {
      await reply.mutateAsync({
        storyId: story.id,
        receiverId: group.userId,
        messageContent: trimmed,
      });
      setReplyText("");
      setReplyFocused(false);
      onResume();
    } catch (err) {
      window.alert(storiesErrorMessage(err));
      onResume();
    }
  }

  if (story.isOwn) {
    const likesLabel =
      story.reactionCount > 0
        ? ` · ${story.reactionCount} like${story.reactionCount === 1 ? "" : "s"}`
        : "";
    return (
      <div
        className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 to-transparent px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-12"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onOpenViewers}
          className="locale-text text-start text-sm font-medium text-white/90 hover:text-white"
        >
          {story.viewCount} view{story.viewCount === 1 ? "" : "s"}
          {likesLabel}
        </button>
        <p className="mt-1 text-xs text-white/65">
          Tap to see who viewed and liked
        </p>
      </div>
    );
  }

  const canSend = Boolean(replyText.trim()) && !reply.isPending;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2.5 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-12"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className={cn(
          "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/30 bg-black/40 px-4",
          replyFocused && "border-white/50 bg-black/55"
        )}
      >
        <Input
          value={replyText}
          onChange={(event) => setReplyText(event.target.value)}
          onFocus={() => {
            setReplyFocused(true);
            onPause();
          }}
          onBlur={() => {
            setReplyFocused(false);
            if (!reply.isPending) onResume();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSendReply();
            }
          }}
          placeholder="Send message"
          maxLength={MAX_STORY_REPLY_LENGTH}
          disabled={reply.isPending}
          className="h-9 flex-1 border-0 bg-transparent px-0 text-[15px] text-white shadow-none placeholder:text-white/55 focus-visible:ring-0"
        />
        {canSend ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0 text-white hover:bg-white/15"
            aria-label="Send reply"
            disabled={reply.isPending}
            onClick={() => void handleSendReply()}
          >
            {reply.isPending ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <Send className="h-[18px] w-[18px]" strokeWidth={2.25} />
            )}
          </Button>
        ) : null}
      </div>

      {!replyFocused ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-11 w-11 shrink-0 rounded-full text-white hover:bg-white/10"
          aria-label={reacted ? "Unlike story" : "Like story"}
          disabled={react.isPending}
          onClick={() => void handleReact()}
        >
          <Heart
            className={cn(
              "h-[26px] w-[26px]",
              reacted ? "fill-[#FF3040] text-[#FF3040]" : "text-white"
            )}
            strokeWidth={reacted ? 1.5 : 2}
          />
        </Button>
      ) : null}
    </div>
  );
}
