"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  CalendarDays,
  Forward,
  ImageIcon,
  MapPin,
  Play,
  UserRound,
  Video,
} from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import type {
  ChatSharedEvent,
  ChatSharedJob,
  ChatSharedPost,
  ChatSharedProfile,
  ChatSharedStory,
} from "@/features/chat/types/chat.types";
import { PostProjectShareCard } from "@/components/feed/post-project-share-card";
import { EventDetailDialog } from "@/components/events/event-detail-dialog";
import { cn } from "@/lib/utils";

function ShareLabel({ label }: { label: string }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
      <Forward className="h-3.5 w-3.5" />
      {label}
    </p>
  );
}

const UNAVAILABLE_COPY = {
  post: ["Post unavailable", "This post was deleted or its visibility changed."],
  job: ["Job no longer available", "The job was removed or closed by the poster."],
  event: ["Event unavailable", "This event was deleted or is private."],
  profile: ["Profile unavailable", "This member’s profile can’t be viewed."],
  story: ["Story unavailable", "This story has expired or was deleted."],
} as const;

function UnavailableCard({ kind }: { kind: keyof typeof UNAVAILABLE_COPY }) {
  const [title, body] = UNAVAILABLE_COPY[kind];
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-0.5">{body}</p>
    </div>
  );
}

const cardShell =
  "block overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-colors hover:bg-muted/30";

export function SharedPostCard({
  post,
  onOpen,
}: {
  post: ChatSharedPost | null;
  /** Open post preview dialog instead of navigating away. */
  onOpen?: (postId: number) => void;
}) {
  const shareLabel = post?.isProjectShare
    ? "Shared a project"
    : post?.isPropertyShare
      ? "Shared a property"
      : "Shared a post";

  const richProjectShare =
    post?.isProjectShare && post.projectData != null;

  return (
    <div>
      <ShareLabel label={shareLabel} />
      {!post ? (
        <UnavailableCard kind="post" />
      ) : richProjectShare ? (
        <div className="locale-text w-full min-w-0">
          {post.description ? (
            <p className="mb-2 line-clamp-3 px-0.5 text-[13px] leading-snug text-foreground/90">
              {post.description}
            </p>
          ) : null}
          <PostProjectShareCard
            projectData={post.projectData}
            variant="embed"
          />
        </div>
      ) : (
        <button
          type="button"
          className={cn(cardShell, "locale-text w-full cursor-pointer text-start")}
          onClick={() => onOpen?.(post.id)}
          aria-label="View shared post"
        >
          <div className="flex items-center gap-2.5 px-3 pt-3">
            <Avatar className="h-8 w-8">
              {post.avatarUrl ? (
                <AvatarImage src={post.avatarUrl} alt="" />
              ) : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {post.authorName || "Member"}
              </p>
              {post.userName ? (
                <p className="truncate text-[11px] text-muted-foreground">
                  @{post.userName}
                </p>
              ) : null}
            </div>
          </div>

          {post.description ? (
            <p className="line-clamp-3 px-3 pt-2 text-[13px] leading-snug text-foreground/90">
              {post.description}
            </p>
          ) : null}

          {post.imageUrl ? (
            <RemoteImg
              src={post.imageUrl}
              alt=""
              wrapperClassName="mt-2 h-36 w-full"
              className="h-36 w-full object-cover"
            />
          ) : null}

          {post.isPropertyShare || post.isProjectShare ? (
            <div className="flex items-start gap-2 border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {post.propertyTitle ||
                    post.projectTitle ||
                    (post.isProjectShare ? "Project" : "Property")}
                </span>
                {post.propertyLocation ? (
                  <span className="mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3" />
                    {post.propertyLocation}
                  </span>
                ) : null}
              </span>
            </div>
          ) : (
            <div className="h-2" aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}

export function SharedJobCard({ job }: { job: ChatSharedJob | null }) {
  return (
    <div>
      <ShareLabel label="Shared a job" />
      {!job ? (
        <UnavailableCard kind="job" />
      ) : (
        <Link href={`/jobs/${job.id}`} className={cn(cardShell, "block px-3 py-3")}>
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold leading-snug">
                {job.title || "Job opportunity"}
              </p>
              {job.company ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {job.company}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {job.location ? <span>📍 {job.location}</span> : null}
                {job.employmentType ? <span>💼 {job.employmentType}</span> : null}
                {job.jobType ? <span>🏢 {job.jobType}</span> : null}
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

export function SharedEventCard({ event }: { event: ChatSharedEvent | null }) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="w-full min-w-0">
      <ShareLabel label="Shared an event" />
      {!event ? (
        <UnavailableCard kind="event" />
      ) : (
        <>
          <button
            type="button"
            className={cn(cardShell, "block w-full text-start")}
            onClick={() => setDetailOpen(true)}
          >
            {event.coverUrl ? (
              <RemoteImg
                src={event.coverUrl}
                alt=""
                wrapperClassName="h-24 w-full"
                className="h-24 w-full object-cover"
              />
            ) : (
              <div className="flex h-16 items-center justify-center bg-muted">
                <CalendarDays className="h-7 w-7 text-muted-foreground" />
              </div>
            )}
            <div className="space-y-0.5 px-3 py-2.5">
              {event.category ? (
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {event.category}
                </p>
              ) : null}
              <p className="line-clamp-2 text-sm font-semibold leading-snug">
                {event.title || "Event"}
              </p>
              {event.location ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  📍 {event.location}
                </p>
              ) : null}
              {event.startsAt ? (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  🗓 {event.startsAt}
                </p>
              ) : null}
            </div>
          </button>
          <EventDetailDialog
            eventId={event.id}
            open={detailOpen}
            onOpenChange={setDetailOpen}
            previewTitle={event.title}
          />
        </>
      )}
    </div>
  );
}

export function SharedProfileCard({
  profile,
}: {
  profile: ChatSharedProfile | null;
}) {
  const href = profile
    ? profile.userName
      ? `/u/${profile.userName}`
      : `/profile/${profile.id}`
    : null;

  return (
    <div>
      <ShareLabel label="Shared a profile" />
      {!profile || !href ? (
        <UnavailableCard kind="profile" />
      ) : (
        <Link href={href} className={cn(cardShell, "flex items-center gap-3 px-3 py-3")}>
          <Avatar className="h-12 w-12">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt="" />
            ) : null}
            <AvatarPlaceholderFallback />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {profile.name || "Member"}
            </p>
            {profile.userName ? (
              <p className="truncate text-xs text-muted-foreground">
                @{profile.userName}
              </p>
            ) : null}
            {profile.role || profile.company ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[profile.role, profile.company].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            <p className="mt-1 text-xs font-semibold text-primary">
              View profile
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}

export function SharedStoryCard({ story }: { story: ChatSharedStory | null }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const previewUrl = story?.previewUrl ?? null;
  const isVideo = story?.mediaType?.toLowerCase() === "video";
  const showThumb = Boolean(previewUrl) && !thumbFailed;

  useEffect(() => {
    setThumbFailed(false);
  }, [previewUrl]);

  return (
    <div>
      <ShareLabel label="Replied to a story" />
      {!story || story.isExpired ? (
        <UnavailableCard kind="story" />
      ) : (
        <div className={cardShell}>
          {showThumb ? (
            <div className="relative">
              <RemoteImg
                src={previewUrl!}
                alt=""
                referrerPolicy="no-referrer"
                wrapperClassName="h-40 w-full"
                className="h-40 w-full object-cover"
                onError={() => setThumbFailed(true)}
              />
              {isVideo ? (
                <span className="absolute bottom-2 end-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white">
                  <Play className="ms-0.5 h-3.5 w-3.5 fill-current" aria-hidden />
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
              {isVideo ? (
                <Video className="h-8 w-8 opacity-50" aria-hidden />
              ) : (
                <ImageIcon className="h-8 w-8 opacity-50" aria-hidden />
              )}
              <span className="text-xs">Preview unavailable</span>
            </div>
          )}
          {story.ownerName ? (
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {story.ownerName}&apos;s story
              {isVideo ? " · Video" : null}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
