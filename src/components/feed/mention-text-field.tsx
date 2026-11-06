"use client";

import { useEffect, type MutableRefObject } from "react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useMentionComposer } from "@/features/feed/hooks/use-mention-composer";
import { cn } from "@/lib/utils";

export type MentionComposerHandle = {
  getMentionPayload: () => {
    mentionedUserIds: number[];
    mentionedUsers: Array<{
      user_id: number;
      display_name: string;
      user_name: string;
    }>;
  };
  resetMentions: () => void;
};

export function MentionTextField({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  className,
  composerRef,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
  composerRef?: MutableRefObject<MentionComposerHandle | null>;
}) {
  const mentions = useMentionComposer({ value, onChange, enabled: !disabled });

  useEffect(() => {
    if (!composerRef) return;
    composerRef.current = {
      getMentionPayload: mentions.getMentionPayload,
      resetMentions: mentions.resetMentions,
    };
    return () => {
      composerRef.current = null;
    };
  }, [composerRef, mentions.getMentionPayload, mentions.resetMentions]);

  return (
    <div className="relative">
      <Textarea
        ref={mentions.textareaRef}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(className)}
        onChange={(e) => {
          const next = e.target.value;
          const cursor = e.target.selectionStart ?? next.length;
          mentions.handleChange(next, cursor);
        }}
        onSelect={(e) => {
          const target = e.currentTarget;
          mentions.syncQueryFromCursor(
            target.value,
            target.selectionStart ?? target.value.length
          );
        }}
        onKeyUp={(e) => {
          const target = e.currentTarget;
          mentions.syncQueryFromCursor(
            target.value,
            target.selectionStart ?? target.value.length
          );
        }}
      />

      {mentions.mentionActive ? (
        <div
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
          role="listbox"
          aria-label="Mention suggestions"
        >
          {mentions.catalogLoading && mentions.suggestions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Loading connections…
            </p>
          ) : mentions.suggestions.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No matches for @{mentions.mentionQuery || "…"}
            </p>
          ) : (
            mentions.suggestions.map((person) => (
              <button
                key={person.userId}
                type="button"
                role="option"
                className="locale-text flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-muted/60"
                onMouseDown={(e) => {
                  e.preventDefault();
                  mentions.handleSelect(person);
                }}
              >
                <Avatar className="h-8 w-8">
                  {person.avatarUrl ? (
                    <AvatarImage src={person.avatarUrl} alt="" />
                  ) : null}
                  <AvatarPlaceholderFallback />
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {person.displayName}
                  </span>
                  {person.userName ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      @{person.userName}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
