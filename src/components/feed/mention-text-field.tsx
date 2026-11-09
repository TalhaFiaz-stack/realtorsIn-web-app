"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { createPortal } from "react-dom";
import { AtSign } from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { useMentionComposer } from "@/features/feed/hooks/use-mention-composer";
import { findMentionRanges } from "@/features/feed/lib/mention-query";
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

/** Mirrors ui/textarea base styles so the highlight layer lines up exactly. */
const FIELD_BASE =
  "flex min-h-[88px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-none";

const LIST_MAX_HEIGHT = 264;

type ListPosition = { top: number; left: number; width: number; placement: "below" | "above" };

/**
 * Textarea with @mentions (LinkedIn-style):
 * - selected mentions are highlighted as chips (mirror layer behind the text)
 * - suggestion list anchored at the "@", flips above when there's no room,
 *   rendered in a portal so dialogs don't clip it
 * - ↑/↓ to move, Enter/Tab to pick, Esc to close
 * - Backspace at the end of a mention removes the whole mention
 */
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
  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<ListPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const ranges = useMemo(
    () => findMentionRanges(value, mentions.displayLabels),
    [value, mentions.displayLabels]
  );

  // Where the "@" of the in-progress mention starts (anchor for the list).
  const queryStart = useMemo(() => {
    if (!mentions.mentionActive) return null;
    const el = mentions.textareaRef.current;
    const cursor = el?.selectionStart ?? value.length;
    const at = value.lastIndexOf("@", Math.max(cursor - 1, 0));
    return at >= 0 ? at : null;
  }, [mentions.mentionActive, mentions.textareaRef, value]);

  useEffect(() => setActiveIndex(0), [mentions.mentionQuery]);

  const listOpen = mentions.mentionActive && !disabled;

  const reposition = useCallback(() => {
    const field = mentions.textareaRef.current;
    if (!field) return;
    const fieldRect = field.getBoundingClientRect();
    const anchor = anchorRef.current?.getBoundingClientRect();
    const lineBottom = anchor ? anchor.bottom : fieldRect.top + 28;
    const lineTop = anchor ? anchor.top : fieldRect.top;
    const width = Math.min(360, Math.max(260, fieldRect.width * 0.75));
    const rawLeft = anchor ? anchor.left : fieldRect.left;
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - width - 8));
    const spaceBelow = window.innerHeight - lineBottom;
    const placement = spaceBelow < Math.min(LIST_MAX_HEIGHT, 200) + 12 && lineTop > spaceBelow ? "above" : "below";
    setPosition({
      top: placement === "below" ? lineBottom + 6 : lineTop - 6,
      left,
      width,
      placement,
    });
  }, [mentions.textareaRef]);

  useLayoutEffect(() => {
    if (!listOpen) {
      setPosition(null);
      return;
    }
    reposition();
  }, [listOpen, reposition, value, queryStart]);

  useEffect(() => {
    if (!listOpen) return;
    const onMove = () => reposition();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [listOpen, reposition]);

  function syncScroll() {
    const field = mentions.textareaRef.current;
    if (field && mirrorRef.current) mirrorRef.current.scrollTop = field.scrollTop;
  }

  function removeWholeMention(cursor: number): boolean {
    const hit = ranges.find((r) => cursor > r.start && cursor <= r.end);
    if (!hit) return false;
    // Also swallow the single space we inserted after the mention.
    const end = value[hit.end] === " " && cursor === hit.end ? hit.end + 1 : hit.end;
    const next = value.slice(0, hit.start) + value.slice(end);
    mentions.handleChange(next, hit.start);
    window.requestAnimationFrame(() => {
      mentions.textareaRef.current?.setSelectionRange(hit.start, hit.start);
    });
    return true;
  }

  // Mirror content: text with highlighted mentions + caret anchor at "@".
  const mirror = useMemo(() => {
    const parts: React.ReactNode[] = [];
    let i = 0;
    const pushText = (end: number) => {
      if (end <= i) return;
      if (queryStart != null && queryStart >= i && queryStart < end) {
        parts.push(value.slice(i, queryStart));
        parts.push(<span key={`a-${queryStart}`} ref={anchorRef} />);
        parts.push(value.slice(queryStart, end));
      } else {
        parts.push(value.slice(i, end));
      }
      i = end;
    };
    for (const r of ranges) {
      pushText(r.start);
      parts.push(
        <span
          key={`m-${r.start}`}
          className="rounded-[4px] bg-primary/15 text-primary [box-decoration-break:clone]"
        >
          {value.slice(r.start, r.end)}
        </span>
      );
      i = r.end;
    }
    pushText(value.length);
    if (queryStart === value.length) parts.push(<span key="a-end" ref={anchorRef} />);
    // Trailing newline needs a character to keep heights in sync.
    parts.push("​");
    return parts;
  }, [value, ranges, queryStart]);

  const list = listOpen && position && mounted
    ? createPortal(
        <div
          data-mention-listbox=""
          role="listbox"
          aria-label="Mention suggestions"
          id="mention-suggestions"
          style={{
            position: "fixed",
            top: position.placement === "below" ? position.top : undefined,
            bottom: position.placement === "above" ? window.innerHeight - position.top : undefined,
            left: position.left,
            width: position.width,
            maxHeight: LIST_MAX_HEIGHT,
            pointerEvents: "auto",
          }}
          className="z-[200] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <div className="flex items-center gap-1.5 border-b border-border/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <AtSign className="h-3.5 w-3.5" aria-hidden />
            {mentions.mentionQuery ? `Mention “${mentions.mentionQuery}”` : "Mention a connection"}
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {mentions.catalogLoading && mentions.suggestions.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">Loading connections…</p>
            ) : mentions.catalogError && mentions.suggestions.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                Couldn’t load your connections.{" "}
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    mentions.retryCatalog();
                  }}
                >
                  Retry
                </button>
              </p>
            ) : mentions.suggestions.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground">
                No connections match “{mentions.mentionQuery}”. You can mention people you’re connected with.
              </p>
            ) : (
              mentions.suggestions.map((person, index) => (
                <button
                  key={person.userId}
                  id={`mention-opt-${person.userId}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    "locale-text flex w-full items-center gap-2.5 px-3 py-2 text-start transition-colors",
                    index === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    mentions.handleSelect(person);
                  }}
                >
                  <Avatar className="h-8 w-8">
                    {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
                    <AvatarPlaceholderFallback />
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{person.displayName}</span>
                    {person.userName ? (
                      <span className="block truncate text-xs text-muted-foreground">@{person.userName}</span>
                    ) : null}
                  </span>
                </button>
              ))
            )}
          </div>
          <p className="border-t border-border/70 px-3 py-1.5 text-[10px] text-muted-foreground">
            ↑↓ to navigate · Enter to select · Esc to dismiss
          </p>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      {/* Highlight layer — same box model as the textarea, text visible here. */}
      <div
        ref={mirrorRef}
        aria-hidden
        className={cn(
          FIELD_BASE,
          className,
          // `block`: FIELD_BASE is `flex`, which would turn text runs into flex items.
          "pointer-events-none absolute inset-0 block overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
          disabled && "opacity-50"
        )}
      >
        {mirror}
      </div>

      <textarea
        ref={mentions.textareaRef}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={listOpen}
        aria-controls={listOpen ? "mention-suggestions" : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          listOpen && mentions.suggestions[activeIndex]
            ? `mention-opt-${mentions.suggestions[activeIndex]!.userId}`
            : undefined
        }
        className={cn(
          FIELD_BASE,
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
          className,
          // Text is drawn by the mirror; keep caret + selection visible here.
          "relative whitespace-pre-wrap break-words border-transparent bg-transparent text-transparent caret-foreground [overflow-wrap:anywhere] selection:bg-primary/25 selection:text-transparent"
        )}
        onScroll={syncScroll}
        onChange={(e) => {
          const next = e.target.value;
          const cursor = e.target.selectionStart ?? next.length;
          mentions.handleChange(next, cursor);
          window.requestAnimationFrame(syncScroll);
        }}
        onKeyDown={(e) => {
          if (listOpen && mentions.suggestions.length > 0) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % mentions.suggestions.length);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + mentions.suggestions.length) % mentions.suggestions.length);
              return;
            }
            if ((e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.shiftKey) || e.key === "Tab") {
              e.preventDefault();
              e.stopPropagation();
              const pick = mentions.suggestions[activeIndex];
              if (pick) mentions.handleSelect(pick);
              return;
            }
          }
          if (listOpen && e.key === "Escape") {
            e.preventDefault();
            mentions.dismiss();
            return;
          }
          if (e.key === "Backspace") {
            const el = e.currentTarget;
            if (el.selectionStart === el.selectionEnd && removeWholeMention(el.selectionStart)) {
              e.preventDefault();
            }
          }
        }}
        onSelect={(e) => {
          const target = e.currentTarget;
          mentions.syncQueryFromCursor(target.value, target.selectionStart ?? target.value.length);
        }}
        onBlur={() => mentions.dismiss()}
      />
      {list}
    </div>
  );
}
