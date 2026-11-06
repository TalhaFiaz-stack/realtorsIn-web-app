"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Clock3,
  ImagePlus,
  X,
} from "lucide-react";
import { CreatePostAttachChips } from "@/components/feed/create-post-attach-chips";
import { CreatePostInquiryFields } from "@/components/feed/create-post-inquiry-fields";
import { CreatePostPropertyFields } from "@/components/feed/create-post-property-fields";
import {
  MentionTextField,
  type MentionComposerHandle,
} from "@/components/feed/mention-text-field";
import { PostVisibilityIcon } from "@/components/feed/post-visibility-icon";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineLoader } from "@/components/states/inline-loader";
import {
  useCreatePost,
  type CreateAttachType,
} from "@/features/feed/hooks/use-create-post";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/features/feed/validators/feed.validators";
import { RemoteImg } from "@/components/shared/remote-img";
import { RemoteVideo } from "@/components/shared/remote-video";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toDatetimeLocalValue(isoOrLocal: string): string {
  if (!isoOrLocal) return "";
  const date = new Date(isoOrLocal);
  if (Number.isNaN(date.getTime())) return isoOrLocal;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  displayName,
  avatarUrl,
  initialAttachType = null,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  avatarUrl?: string | null;
  initialAttachType?: "photo" | "video" | null;
  onPublished?: (postId: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionRef = useRef<MentionComposerHandle | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const form = useCreatePost({
    onSuccess: (postId) => {
      onOpenChange(false);
      onPublished?.(postId);
    },
  });

  useEffect(() => {
    form.bindMentionPayload(() => {
      const payload = mentionRef.current?.getMentionPayload();
      return (
        payload ?? {
          mentionedUserIds: [],
          mentionedUsers: [],
        }
      );
    });
    return () => form.bindMentionPayload(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.bindMentionPayload]);

  useEffect(() => {
    if (!open) {
      form.reset();
      mentionRef.current?.resetMentions();
      setScheduleOpen(false);
      return;
    }
    if (initialAttachType) {
      form.selectAttachType(initialAttachType);
      window.setTimeout(() => fileInputRef.current?.click(), 50);
    }
    // Only sync when dialog opens / attach hint changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAttachType]);

  function handleSelectAttach(type: Exclude<CreateAttachType, null>) {
    const wasSelected = form.attachType === type;
    form.selectAttachType(type);
    if (
      !wasSelected &&
      (type === "photo" || type === "video") &&
      !form.pending
    ) {
      window.setTimeout(() => fileInputRef.current?.click(), 0);
    }
  }

  const comingSoonAttach = form.attachType === "off_plan";
  const scheduleActive = Boolean(form.scheduledAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogHeader className="relative border-b border-border px-4 py-3">
          <DialogDescription className="sr-only">
            Share an update, schedule a post, or broadcast a client inquiry.
          </DialogDescription>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2 font-semibold text-[#E85D5D] hover:text-[#E85D5D]"
              disabled={form.pending}
              onClick={() => onOpenChange(false)}
            >
              Discard
            </Button>
            <DialogTitle className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold">
              Create
            </DialogTitle>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  scheduleActive &&
                    "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                )}
                disabled={form.pending}
                aria-expanded={scheduleOpen}
                onClick={() => setScheduleOpen((prev) => !prev)}
              >
                <Clock3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {scheduleActive ? "Scheduled" : "Schedule"}
                </span>
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!form.canSubmit}
                onClick={() => void form.submit()}
              >
                {form.pending ? <InlineLoader /> : null}
                {scheduleActive ? "Schedule" : "Publish"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[min(70vh,36rem)] space-y-4 overflow-y-auto px-4 py-4">
          {scheduleOpen ? (
            <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Schedule post
                </p>
                {scheduleActive ? (
                  <button
                    type="button"
                    className="text-xs font-medium text-destructive"
                    onClick={() => {
                      form.setScheduledAt("");
                      setScheduleOpen(false);
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              <input
                type="datetime-local"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                value={toDatetimeLocalValue(form.scheduledAt)}
                min={toDatetimeLocalValue(
                  new Date(Date.now() + 60_000).toISOString()
                )}
                disabled={form.pending}
                onChange={(e) => form.setScheduledAt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pick a time at least 1 minute ahead. Publish becomes Schedule.
              </p>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 shrink-0">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarPlaceholderFallback />
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <div className="relative mt-1 inline-flex">
                <label className="relative inline-flex cursor-pointer items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
                  <PostVisibilityIcon
                    visibility={form.visibility}
                    className="h-3.5 w-3.5"
                  />
                  {form.visibility === "public" ? "Public" : "Connections"}
                  <ChevronDown className="h-3 w-3" />
                  <select
                    className="absolute inset-0 cursor-pointer opacity-0"
                    value={form.visibility}
                    disabled={form.pending}
                    onChange={(e) =>
                      form.setVisibility(
                        e.target.value as "public" | "connections"
                      )
                    }
                    aria-label="Post visibility"
                  >
                    <option value="connections">Connections</option>
                    <option value="public">Public</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <MentionTextField
            value={form.description}
            onChange={form.setDescription}
            composerRef={mentionRef}
            placeholder={
              form.attachType === "inquiry" || form.attachType === "property"
                ? "Add optional commentary for your network... Use @ to mention"
                : "What do you want to talk about? Use @ to mention"
            }
            rows={
              form.attachType === "inquiry" || form.attachType === "property"
                ? 3
                : 5
            }
            disabled={form.pending}
            className="min-h-[88px] resize-none border-0 bg-transparent px-0 text-[16px] shadow-none focus-visible:ring-0"
          />

          {!scheduleOpen && scheduleActive ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Scheduled for{" "}
                <span className="font-semibold text-foreground">
                  {new Date(form.scheduledAt).toLocaleString()}
                </span>
              </span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setScheduleOpen(true)}
                aria-label="Edit schedule"
              >
                <Clock3 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <CreatePostAttachChips
            attachType={form.attachType}
            disabled={form.pending}
            onSelect={handleSelectAttach}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept={
              form.attachType === "video"
                ? [...ALLOWED_VIDEO_TYPES, "video/*"].join(",")
                : ALLOWED_IMAGE_TYPES.join(",")
            }
            multiple={form.attachType !== "video"}
            className="hidden"
            disabled={form.pending}
            onChange={(e) => {
              if (form.attachType === "property") {
                form.onPickFiles(e.target.files, "property");
                e.target.value = "";
                return;
              }
              const mode =
                form.attachType === "video" || form.attachType === "photo"
                  ? form.attachType
                  : e.target.files?.[0]?.type.startsWith("video/")
                    ? "video"
                    : "photo";
              if (form.attachType !== mode) {
                form.selectAttachType(mode);
              }
              form.onPickFiles(e.target.files, mode);
              e.target.value = "";
            }}
          />

          {form.attachType === "inquiry" ? (
            <CreatePostInquiryFields
              value={form.inquiry}
              onChange={form.setInquiry}
              disabled={form.pending}
            />
          ) : null}

          {form.attachType === "property" ? (
            <CreatePostPropertyFields
              value={form.property}
              onChange={form.setProperty}
              images={form.files.filter((item) => item.kind === "image")}
              maxImages={form.maxFiles}
              onPickImages={() => fileInputRef.current?.click()}
              onRemoveImage={form.removeFile}
              disabled={form.pending}
            />
          ) : null}

          {comingSoonAttach ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
              Off Plan sharing is available in the mobile app. Photo, video,
              inquiry, and property listing posts work here now.
            </div>
          ) : null}

          {(form.attachType === "photo" || form.attachType === "video") && (
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  form.pending ||
                  (form.attachType === "photo"
                    ? form.files.length >= form.maxFiles
                    : form.files.length >= 1)
                }
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {form.attachType === "photo" ? "Add photos" : "Add video"}
              </Button>

              {form.files.length > 0 ? (
                <ul
                  className={cn(
                    "grid gap-2",
                    form.attachType === "video"
                      ? "grid-cols-1"
                      : "grid-cols-2 sm:grid-cols-3"
                  )}
                >
                  {form.files.map((item, index) => (
                    <li
                      key={item.url}
                      className="relative overflow-hidden rounded-lg border border-border"
                    >
                      {item.kind === "image" ? (
                        <RemoteImg
                          src={item.url}
                          alt=""
                          wrapperClassName="aspect-square w-full"
                          className="aspect-square h-full w-full object-cover"
                        />
                      ) : (
                        <RemoteVideo
                          src={item.url}
                          wrapperClassName="aspect-video w-full"
                          className="aspect-video h-full w-full object-cover"
                          muted
                          controls
                        />
                      )}
                      <button
                        type="button"
                        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                        aria-label="Remove file"
                        onClick={() => form.removeFile(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          {form.error ? (
            <p className="text-sm text-destructive" role="alert">
              {form.error}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
