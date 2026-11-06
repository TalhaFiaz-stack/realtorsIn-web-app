"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThumbsUp } from "lucide-react";
import { PostReactionIcon } from "@/features/feed/constants/post-reaction-icons";
import {
  getPostReactionMeta,
  POST_REACTION_OPTIONS,
  type PostReactionType,
} from "@/features/feed/constants/post-reactions";
import {
  dismissAllReactionPickers,
  subscribeReactionPickerDismiss,
} from "@/features/feed/lib/dismiss-reaction-pickers";
import { cn } from "@/lib/utils";

const PICKER_WIDTH = 320;
const COMPACT_PICKER_WIDTH = 288;
const PICKER_BAR_HEIGHT = 52;
const COMPACT_PICKER_BAR_HEIGHT = 48;
const HOVER_BRIDGE_PX = 20;
const HOVER_OPEN_DELAY_MS = 350;
const CLOSE_DELAY_MS = 450;
const POINTER_FOCUS_GRACE_MS = 600;

function pointInRect(x: number, y: number, rect: DOMRect) {
  return (
    x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
}

export function PostReactionButton({
  isLiked,
  userReaction,
  disabled,
  className,
  pickerPortal = false,
  enableHoverPicker,
  pickerAlign = "center",
  compact = false,
  onTapToggle,
  onSelectReaction,
}: {
  isLiked: boolean;
  userReaction: PostReactionType | null;
  disabled?: boolean;
  className?: string;
  /** Use when parent clips overflow (e.g. scrollable modals). */
  pickerPortal?: boolean;
  /** Hover-to-open picker (enable for portaled comment rows). */
  enableHoverPicker?: boolean;
  /** Align picker to the start of the trigger (comment rows). */
  pickerAlign?: "start" | "center";
  /** Smaller picker bar for inline comment actions. */
  compact?: boolean;
  onTapToggle: () => void;
  onSelectReaction: (type: PostReactionType) => void;
}) {
  const pickerWidth = compact ? COMPACT_PICKER_WIDTH : PICKER_WIDTH;
  const pickerBarHeight = compact ? COMPACT_PICKER_BAR_HEIGHT : PICKER_BAR_HEIGHT;
  const hoverPickerEnabled = enableHoverPicker ?? !pickerPortal;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [portalCoords, setPortalCoords] = useState<{
    top: number;
    left: number;
    height: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerShellRef = useRef<HTMLDivElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressHandledRef = useRef(false);
  const lastPointerAtRef = useRef(0);
  const onSelectReactionRef = useRef(onSelectReaction);
  onSelectReactionRef.current = onSelectReaction;
  const pickerOpenRef = useRef(false);
  const pointerInZoneRef = useRef(false);

  const setPickerOpenState = useCallback((open: boolean) => {
    pickerOpenRef.current = open;
    setPickerOpen(open);
  }, []);

  const activeType = isLiked ? userReaction ?? "like" : null;
  const meta = getPostReactionMeta(activeType);
  const label = meta?.label ?? "Like";
  const accent = meta?.accentColor;

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const isPointerOverReactionUi = useCallback((x: number, y: number) => {
    const target = document.elementFromPoint(x, y);
    if (target) {
      if (rootRef.current?.contains(target)) return true;
      if (pickerShellRef.current?.contains(target)) return true;
    }

    const button = buttonRef.current;
    if (button && pointInRect(x, y, button.getBoundingClientRect())) {
      return true;
    }

    const shell = pickerShellRef.current;
    if (!shell || !pickerOpenRef.current) return false;

    const shellRect = shell.getBoundingClientRect();
    if (pointInRect(x, y, shellRect)) return true;

    if (button) {
      const btnRect = button.getBoundingClientRect();
      const bridgeTop = Math.min(shellRect.top, btnRect.top);
      const bridgeBottom = Math.max(shellRect.bottom, btnRect.bottom);
      const left = Math.min(shellRect.left, btnRect.left) - 12;
      const right = Math.max(shellRect.right, btnRect.right) + 12;
      if (
        x >= left &&
        x <= right &&
        y >= bridgeTop &&
        y <= bridgeBottom
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setPickerOpenState(false);
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer, setPickerOpenState]);

  const cancelClose = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handlePointerExitHoverZone = useCallback(
    (event: React.PointerEvent) => {
      const { clientX, clientY } = event;
      requestAnimationFrame(() => {
        if (isPointerOverReactionUi(clientX, clientY)) {
          pointerInZoneRef.current = true;
          cancelClose();
          return;
        }
        pointerInZoneRef.current = false;
        scheduleClose();
        if (!pickerOpenRef.current) {
          clearOpenTimer();
        }
      });
    },
    [cancelClose, clearOpenTimer, isPointerOverReactionUi, scheduleClose]
  );

  const placePortalPicker = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const shellHeight = pickerBarHeight + HOVER_BRIDGE_PX;
    const alignedLeft =
      pickerAlign === "start"
        ? rect.left
        : rect.left + rect.width / 2 - pickerWidth / 2;
    const left = Math.min(
      Math.max(8, alignedLeft),
      window.innerWidth - pickerWidth - 8
    );
    setPortalCoords({
      top: Math.max(8, rect.top - shellHeight),
      left,
      height: shellHeight,
    });
  }, [pickerAlign, pickerBarHeight, pickerWidth]);

  const openPicker = useCallback(() => {
    cancelClose();
    clearOpenTimer();
    if (!pickerOpenRef.current) {
      dismissAllReactionPickers();
    }
    if (pickerPortal) {
      placePortalPicker();
    }
    pointerInZoneRef.current = true;
    setPickerOpenState(true);
  }, [cancelClose, clearOpenTimer, pickerPortal, placePortalPicker, setPickerOpenState]);

  const closePicker = useCallback(() => {
    clearOpenTimer();
    cancelClose();
    setPickerOpenState(false);
  }, [cancelClose, clearOpenTimer, setPickerOpenState]);

  const dismissReactionUi = useCallback(() => {
    closePicker();
  }, [closePicker]);

  const commitReaction = useCallback(
    (type: PostReactionType) => {
      closePicker();
      onSelectReactionRef.current(type);
    },
    [closePicker]
  );

  const scheduleOpen = useCallback(() => {
    if (!hoverPickerEnabled) return;
    if (openTimerRef.current || pickerOpenRef.current) return;
    clearOpenTimer();
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      openPicker();
    }, HOVER_OPEN_DELAY_MS);
  }, [clearOpenTimer, hoverPickerEnabled, openPicker]);

  const markPointer = useCallback(() => {
    lastPointerAtRef.current = Date.now();
  }, []);

  const onHoverZoneEnter = useCallback(() => {
    markPointer();
    pointerInZoneRef.current = true;
    cancelClose();
    if (
      hoverPickerEnabled &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover)").matches
    ) {
      scheduleOpen();
    }
  }, [cancelClose, hoverPickerEnabled, markPointer, scheduleOpen]);

  useEffect(() => {
    if (!pickerOpen || !pickerPortal) return;
    placePortalPicker();
    const onLayout = () => placePortalPicker();
    window.addEventListener("scroll", onLayout, true);
    window.addEventListener("resize", onLayout);
    return () => {
      window.removeEventListener("scroll", onLayout, true);
      window.removeEventListener("resize", onLayout);
    };
  }, [pickerOpen, pickerPortal, placePortalPicker]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePicker();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pickerOpen, closePicker]);

  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    },
    [clearCloseTimer, clearOpenTimer]
  );

  useEffect(() => subscribeReactionPickerDismiss(dismissReactionUi), [dismissReactionUi]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onFocusIn(event: FocusEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (pickerShellRef.current?.contains(target)) return;
      dismissReactionUi();
    }
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [pickerOpen, dismissReactionUi]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onPointerMove(event: PointerEvent) {
      const over = isPointerOverReactionUi(event.clientX, event.clientY);
      if (over) {
        if (!pointerInZoneRef.current) {
          pointerInZoneRef.current = true;
          cancelClose();
        }
        return;
      }
      if (pointerInZoneRef.current) {
        pointerInZoneRef.current = false;
        scheduleClose();
      }
    }
    document.addEventListener("pointermove", onPointerMove);
    return () => document.removeEventListener("pointermove", onPointerMove);
  }, [pickerOpen, cancelClose, isPointerOverReactionUi, scheduleClose]);

  const emojiRow = (
    <div
      role="listbox"
      aria-label="Choose reaction"
      className="flex w-full gap-0.5 rounded-full border border-border bg-card px-1.5 py-1 shadow-lg sm:px-2 sm:py-1.5"
      style={{ width: pickerWidth, maxWidth: "min(100vw - 16px, 95vw)" }}
    >
      {POST_REACTION_OPTIONS.map((option) => (
        <button
          key={option.type}
          type="button"
          role="option"
          aria-label={option.label}
          className={cn(
            "flex flex-1 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95",
            compact ? "h-9 w-9" : "h-10 w-10"
          )}
          onClick={(event) => {
            event.stopPropagation();
            commitReaction(option.type);
          }}
        >
          <PostReactionIcon type={option.type} size={compact ? 24 : 28} />
        </button>
      ))}
    </div>
  );

  const pickerShell = (
    <div
      ref={pickerShellRef}
      className={cn(
        "flex flex-col animate-in fade-in zoom-in-95 duration-150",
        pickerPortal
          ? "fixed z-[100]"
          : cn(
              "absolute bottom-full z-10 mb-0",
              pickerAlign === "start"
                ? "left-0"
                : "left-1/2 -translate-x-1/2"
            )
      )}
      style={
        pickerPortal && portalCoords
          ? {
              top: portalCoords.top,
              left: portalCoords.left,
              width: pickerWidth,
              height: portalCoords.height,
            }
          : pickerPortal
            ? {
                width: pickerWidth,
                height: pickerBarHeight + HOVER_BRIDGE_PX,
              }
            : { width: pickerWidth, maxWidth: "min(100vw - 16px, 95vw)" }
      }
      onPointerEnter={onHoverZoneEnter}
      onPointerLeave={handlePointerExitHoverZone}
    >
      {emojiRow}
      <div
        className="min-h-[20px] flex-1 shrink-0"
        aria-hidden
        onPointerEnter={onHoverZoneEnter}
      />
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={cn("relative flex min-w-0 justify-center", className ?? "w-full")}
      onPointerEnter={onHoverZoneEnter}
      onPointerLeave={handlePointerExitHoverZone}
    >
      {pickerOpen && !pickerPortal ? pickerShell : null}
      {pickerOpen && pickerPortal && typeof document !== "undefined"
        ? createPortal(pickerShell, document.body)
        : null}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-md px-1 text-[13px] font-semibold leading-none text-muted-foreground transition-[color,background-color,transform] duration-200 ease-out hover:bg-muted active:scale-[0.98] disabled:opacity-50 sm:gap-2 sm:px-2",
          isLiked && accent && "hover:bg-transparent"
        )}
        style={isLiked && accent ? { color: accent } : undefined}
        aria-pressed={isLiked}
        aria-label={label}
        aria-expanded={pickerOpen}
        aria-haspopup="listbox"
        onPointerEnter={onHoverZoneEnter}
        onFocus={() => {
          clearOpenTimer();
          const recentPointer =
            Date.now() - lastPointerAtRef.current < POINTER_FOCUS_GRACE_MS;
          if (!recentPointer) closePicker();
        }}
        onBlur={(event) => {
          const related = event.relatedTarget as Node | null;
          if (related && rootRef.current?.contains(related)) return;
          if (related && pickerShellRef.current?.contains(related)) return;
        }}
        onPointerDown={() => {
          markPointer();
          longPressHandledRef.current = false;
          if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
          holdTimerRef.current = setTimeout(() => {
            longPressHandledRef.current = true;
            openPicker();
          }, 400);
        }}
        onPointerUp={() => {
          markPointer();
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }}
        onPointerCancel={() => {
          if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          openPicker();
        }}
        onClick={(event) => {
          if (longPressHandledRef.current) {
            longPressHandledRef.current = false;
            return;
          }
          if (pickerOpen) {
            event.preventDefault();
            closePicker();
          }
          onTapToggle();
        }}
      >
        <span
          key={activeType ?? "like-off"}
          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center animate-in fade-in zoom-in-95 duration-200"
        >
          {activeType ? (
            <PostReactionIcon type={activeType} size={18} />
          ) : (
            <ThumbsUp className="h-[18px] w-[18px]" aria-hidden />
          )}
        </span>
        <span className="truncate transition-colors duration-200">{label}</span>
      </button>
    </div>
  );
}
