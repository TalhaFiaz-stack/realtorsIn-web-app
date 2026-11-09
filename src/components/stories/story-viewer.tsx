"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { RemoteVideo } from "@/components/shared/remote-video";
import { StoryViewerFooter } from "@/components/stories/story-viewer-footer";
import { StoryViewersSheet } from "@/components/stories/story-viewers-sheet";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { useConfirm } from "@/components/common/confirm-provider";
import { Button } from "@/components/ui/button";
import { confirmDeleteStory } from "@/constants/confirm-copy";
import { DEFAULT_STORY_IMAGE_DURATION_MS } from "@/features/stories/constants/story.constants";
import {
  storiesErrorMessage,
  useDeleteStory,
  useMarkStoryViewed,
} from "@/features/stories/hooks/use-stories";
import type { StoryUserGroup } from "@/features/stories/types/story.types";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { showAppToast } from "@/lib/toast/app-toast";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StoryViewer({
  open,
  groups,
  startUserId,
  onClose,
}: {
  open: boolean;
  groups: StoryUserGroup[];
  startUserId: number | null;
  onClose: () => void;
}) {
  const { confirm } = useConfirm();
  const markViewed = useMarkStoryViewed();
  const remove = useDeleteStory();

  const ordered = useMemo(
    () => groups.filter((group) => group.stories.length > 0),
    [groups]
  );

  const startIndex = Math.max(
    0,
    ordered.findIndex((group) => group.userId === startUserId)
  );
  const [userIndex, setUserIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [viewersOpen, setViewersOpen] = useState(false);
  // Browsers block autoplay with sound — start muted, let the viewer unmute.
  const [muted, setMuted] = useState(true);
  const holdTimerRef = useRef<number | null>(null);
  const heldRef = useRef(false);
  const [userSlideDir, setUserSlideDir] = useState<1 | -1 | null>(null);
  const [userSliding, setUserSliding] = useState(false);
  const viewedRef = useRef<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const advancingRef = useRef(false);

  const group = ordered[userIndex] ?? null;
  const story = group?.stories[storyIndex] ?? null;

  const navRef = useRef({ userIndex, storyIndex });
  navRef.current = { userIndex, storyIndex };

  const goNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    window.setTimeout(() => {
      advancingRef.current = false;
    }, 280);

    const { userIndex: ui, storyIndex: si } = navRef.current;
    const currentGroup = ordered[ui];
    if (!currentGroup) {
      onClose();
      return;
    }
    if (si < currentGroup.stories.length - 1) {
      setStoryIndex(si + 1);
      setProgress(0);
      return;
    }
    if (ui < ordered.length - 1) {
      setUserSlideDir(1);
      setUserSliding(true);
      setUserIndex(ui + 1);
      setStoryIndex(0);
      setProgress(0);
      return;
    }
    onClose();
  }, [onClose, ordered]);

  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  const goPrev = useCallback(() => {
    const { userIndex: ui, storyIndex: si } = navRef.current;
    if (si > 0) {
      setStoryIndex(si - 1);
      setProgress(0);
      return;
    }
    if (ui > 0) {
      const prevGroup = ordered[ui - 1];
      setUserSlideDir(-1);
      setUserSliding(true);
      setUserIndex(ui - 1);
      setStoryIndex(Math.max(0, (prevGroup?.stories.length ?? 1) - 1));
      setProgress(0);
    }
  }, [ordered]);

  const orderedRef = useRef(ordered);
  orderedRef.current = ordered;

  // Reset only when the viewer opens (not when the list refreshes mid-view —
  // that used to jump back to the first story).
  useEffect(() => {
    if (!open) return;
    const idx = orderedRef.current.findIndex((item) => item.userId === startUserId);
    setUserIndex(idx >= 0 ? idx : 0);
    setStoryIndex(0);
    setProgress(0);
    setPaused(false);
    setMediaLoading(true);
    setViewersOpen(false);
    setUserSlideDir(null);
    setUserSliding(false);
    viewedRef.current = new Set();
  }, [open, startUserId]);

  const playbackBlocked =
    paused || mediaLoading || userSliding || viewersOpen;

  useEffect(() => {
    setProgress(0);
    setMediaLoading(true);
  }, [story?.id]);

  useEffect(() => {
    if (!open || !story) return;
    if (viewedRef.current.has(story.id) || story.hasViewed) return;
    viewedRef.current.add(story.id);
    markViewed.mutate(story.id);
  }, [open, story, markViewed]);

  useEffect(() => {
    if (!open || !story || playbackBlocked) return;
    if (story.mediaType === "video") return;

    const duration = story.durationMs || DEFAULT_STORY_IMAGE_DURATION_MS;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        goNextRef.current();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    open,
    story?.id,
    story?.mediaType,
    story?.durationMs,
    playbackBlocked,
  ]);

  useEffect(() => {
    if (!open || !story || story.mediaType !== "video" || playbackBlocked) {
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    const tick = () => {
      if (!video.paused && !playbackBlocked && video.duration > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, story?.id, story?.mediaType, playbackBlocked]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || story?.mediaType !== "video") return;
    if (playbackBlocked) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [story?.id, story?.mediaType, playbackBlocked]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goNextRef.current();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === " " && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setPaused((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !group || !story) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Story viewer"
    >
      {userIndex > 0 || storyIndex > 0 ? (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-[calc(50%-17rem)] top-1/2 z-[101] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => goNextRef.current()}
        className="absolute right-[calc(50%-17rem)] top-1/2 z-[101] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden sm:h-[min(90vh,820px)] sm:rounded-2xl">
        <div
          key={group.userId}
          className={cn(
            "relative flex h-full min-h-0 flex-col bg-black will-change-transform",
            userSlideDir === 1 && "animate-story-user-from-right",
            userSlideDir === -1 && "animate-story-user-from-left"
          )}
          onAnimationEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            setUserSlideDir(null);
            setUserSliding(false);
          }}
        >
          <div className="absolute inset-x-0 top-0 z-30 space-y-3 px-3 pt-3">
            <div className="flex gap-1">
              {group.stories.map((item, index) => (
                <div
                  key={item.id}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
                >
                  <div
                    className="h-full bg-white will-change-[width]"
                    style={{
                      width:
                        index < storyIndex
                          ? "100%"
                          : index === storyIndex
                            ? `${progress}%`
                            : "0%",
                      transition: "none",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-white/40">
                {group.avatarUrl ? (
                  <AvatarImage src={group.avatarUrl} alt="" />
                ) : null}
                <AvatarPlaceholderFallback />
              </Avatar>
              <Link
                href={group.isOwn ? "/me" : group.userName ? `/u/${group.userName}` : `/profile/${group.userId}`}
                onClick={onClose}
                className="min-w-0 flex-1 hover:underline"
              >
                <p className="truncate text-sm font-semibold text-white">
                  {group.isOwn ? "Your story" : group.name}
                  {story.createdAt ? (
                    <span className="ms-2 text-xs font-normal text-white/70">{formatRelativeTime(story.createdAt)}</span>
                  ) : null}
                </p>
              </Link>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-white hover:bg-white/15"
                aria-label={paused ? "Play story" : "Pause story"}
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              {story.mediaType === "video" ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-white hover:bg-white/15"
                  aria-label={muted ? "Unmute" : "Mute"}
                  onClick={() => setMuted((m) => !m)}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              ) : null}
              {story.isOwn ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-white hover:bg-white/15"
                  aria-label="Delete story"
                  onClick={() => {
                    void (async () => {
                      const preview =
                        story.caption?.trim().slice(0, 140) ||
                        (story.mediaType === "video"
                          ? "Your video story"
                          : "Your photo story");
                      const ok = await confirm(confirmDeleteStory(preview));
                      if (!ok) return;
                      remove.mutate(story.id, {
                        onSuccess: () => {
                          if (group.stories.length <= 1) onClose();
                          else goNextRef.current();
                        },
                        onError: (err) =>
                          showAppToast.error("Couldn't delete story", storiesErrorMessage(err)),
                      });
                    })();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-white hover:bg-white/15"
                aria-label="Close stories"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
            <div
              className="absolute inset-0 z-10 flex"
              onPointerDown={() => {
                heldRef.current = false;
                holdTimerRef.current = window.setTimeout(() => {
                  heldRef.current = true;
                  setPaused(true);
                }, 220);
              }}
              onPointerUp={() => {
                if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                if (heldRef.current) setPaused(false);
              }}
              onPointerLeave={() => {
                if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
                if (heldRef.current) {
                  heldRef.current = false;
                  setPaused(false);
                }
              }}
            >
              <button
                type="button"
                className="h-full w-1/3 cursor-pointer"
                aria-label="Previous story"
                onClick={() => {
                  if (!heldRef.current) goPrev();
                  heldRef.current = false;
                }}
              />
              <span className="h-full w-1/3" aria-hidden />
              <button
                type="button"
                className="h-full w-1/3 cursor-pointer"
                aria-label="Next story"
                onClick={() => {
                  if (!heldRef.current) goNextRef.current();
                  heldRef.current = false;
                }}
              />
            </div>
            {paused && !viewersOpen ? (
              <span className="pointer-events-none absolute z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur" aria-hidden>
                <Pause className="h-6 w-6" />
              </span>
            ) : null}

            <div
              key={story.id}
              className="absolute inset-0 flex items-center justify-center animate-story-segment-in"
            >
              {story.mediaType === "video" ? (
                <RemoteVideo
                  ref={videoRef}
                  src={story.mediaUrl}
                  wrapperClassName="absolute inset-0 flex items-center justify-center bg-black"
                  skeletonClassName="bg-white/10"
                  className="max-h-full max-w-full object-contain"
                  autoPlay
                  playsInline
                  muted={muted}
                  preload="auto"
                  onCanPlay={() => setMediaLoading(false)}
                  onLoadedData={() => setMediaLoading(false)}
                  onEnded={() => goNextRef.current()}
                />
              ) : (
                <RemoteImg
                  src={story.mediaUrl}
                  alt=""
                  wrapperClassName="absolute inset-0 flex items-center justify-center bg-black"
                  skeletonClassName="bg-white/10"
                  className="max-h-full max-w-full object-contain"
                  onLoad={() => setMediaLoading(false)}
                  onError={() => setMediaLoading(false)}
                />
              )}

              {story.caption ? (
                <p className="pointer-events-none absolute inset-x-4 bottom-[5.75rem] z-20 line-clamp-4 rounded-lg bg-black/50 px-3 py-2 text-center text-sm leading-snug text-white">
                  {story.caption}
                </p>
              ) : null}
            </div>
          </div>

          <StoryViewerFooter
            story={story}
            group={group}
            onPause={() => {
              setPaused(true);
              videoRef.current?.pause();
            }}
            onResume={() => {
              setPaused(false);
              void videoRef.current?.play();
            }}
            onOpenViewers={() => {
              setPaused(true);
              videoRef.current?.pause();
              setViewersOpen(true);
            }}
          />
        </div>
      </div>

      <StoryViewersSheet
        open={viewersOpen}
        storyId={story.id}
        onClose={() => {
          setViewersOpen(false);
          setPaused(false);
          void videoRef.current?.play();
        }}
      />
    </div>
  );

  if (typeof document === "undefined") return overlay;
  return createPortal(overlay, document.body);
}
