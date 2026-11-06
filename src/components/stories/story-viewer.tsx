"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
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

  useEffect(() => {
    if (!open) return;
    const idx = ordered.findIndex((item) => item.userId === startUserId);
    setUserIndex(idx >= 0 ? idx : 0);
    setStoryIndex(0);
    setProgress(0);
    setPaused(false);
    setMediaLoading(true);
    setViewersOpen(false);
    setUserSlideDir(null);
    setUserSliding(false);
    viewedRef.current = new Set();
  }, [open, startUserId, ordered]);

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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {group.name}
                </p>
              </div>
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
                          window.alert(storiesErrorMessage(err)),
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
            <button
              type="button"
              className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
              aria-label="Previous story"
              onClick={goPrev}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer"
              aria-label="Next story"
              onClick={() => goNextRef.current()}
            />

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
                  muted={false}
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
