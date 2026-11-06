"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Video } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { RemoteVideo } from "@/components/shared/remote-video";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_STORY_IMAGE_DURATION_MS,
  DEFAULT_STORY_VISIBILITY,
  MAX_STORY_CAPTION_LENGTH,
  MAX_STORY_UPLOAD_BYTES,
  MAX_STORY_VIDEO_DURATION_MS,
  STORY_IMAGE_TYPES,
  STORY_VIDEO_TYPES,
} from "@/features/stories/constants/story.constants";
import {
  storiesErrorMessage,
  useCreateStory,
} from "@/features/stories/hooks/use-stories";

export function CreateStoryForm({
  onPublished,
  onCancel,
  showCancel = true,
}: {
  onPublished?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const create = useCreateStory();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [durationMs, setDurationMs] = useState(DEFAULT_STORY_IMAGE_DURATION_MS);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption("");
    setDurationMs(DEFAULT_STORY_IMAGE_DURATION_MS);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onPick(next: File | undefined) {
    if (!next) return;
    setError(null);
    if (next.size > MAX_STORY_UPLOAD_BYTES) {
      setError("File is too large (max 50MB)");
      return;
    }
    const mime = next.type;
    const isImage = (STORY_IMAGE_TYPES as readonly string[]).includes(mime);
    const isVideo = (STORY_VIDEO_TYPES as readonly string[]).includes(mime);
    if (!isImage && !isVideo) {
      setError("Choose a photo or video");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(next);
    setFile(next);
    setPreviewUrl(url);
    setMediaType(isVideo ? "video" : "image");
    setDurationMs(
      isVideo ? MAX_STORY_VIDEO_DURATION_MS : DEFAULT_STORY_IMAGE_DURATION_MS
    );
  }

  async function onPublish() {
    if (!file) {
      setError("Choose a photo or video first");
      return;
    }
    setError(null);
    const form = new FormData();
    form.append("media", file, file.name);
    form.append("media_type", mediaType);
    form.append("visibility", DEFAULT_STORY_VISIBILITY);
    form.append("duration_ms", String(durationMs));
    if (caption.trim()) form.append("caption", caption.trim());
    try {
      await create.mutateAsync(form);
      reset();
      onPublished?.();
    } catch (err) {
      setError(storiesErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept={[...STORY_IMAGE_TYPES, ...STORY_VIDEO_TYPES].join(",")}
        capture="environment"
        className="sr-only"
        onChange={(event) => onPick(event.target.files?.[0])}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl bg-black">
          {mediaType === "video" ? (
            <RemoteVideo
              src={previewUrl}
              wrapperClassName="w-full max-h-80"
              className="max-h-80 w-full object-contain"
              controls
              onLoadedMetadata={(event) => {
                const seconds = event.currentTarget.duration;
                if (Number.isFinite(seconds) && seconds > 0) {
                  const ms = Math.min(
                    MAX_STORY_VIDEO_DURATION_MS,
                    Math.round(seconds * 1000)
                  );
                  setDurationMs(ms);
                  if (seconds * 1000 > MAX_STORY_VIDEO_DURATION_MS) {
                    setError("Videos must be 30 seconds or shorter");
                  }
                }
              }}
            />
          ) : (
            <RemoteImg
              src={previewUrl}
              alt=""
              wrapperClassName="w-full max-h-80"
              className="max-h-80 w-full object-contain"
            />
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute right-2 top-2"
            onClick={() => fileRef.current?.click()}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-28 flex-col gap-2"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = STORY_IMAGE_TYPES.join(",");
                fileRef.current.click();
              }
            }}
          >
            <ImagePlus className="h-6 w-6 text-primary" />
            Photo
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-28 flex-col gap-2"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = STORY_VIDEO_TYPES.join(",");
                fileRef.current.click();
              }
            }}
          >
            <Video className="h-6 w-6 text-primary" />
            Video
          </Button>
        </div>
      )}

      <Input
        value={caption}
        maxLength={MAX_STORY_CAPTION_LENGTH}
        placeholder="Add a caption (optional)"
        onChange={(event) => setCaption(event.target.value)}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {showCancel && onCancel ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={create.isPending}
          >
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          onClick={() => void onPublish()}
          disabled={!file || create.isPending}
        >
          {create.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : null}
          Share story
        </Button>
      </div>
    </div>
  );
}
