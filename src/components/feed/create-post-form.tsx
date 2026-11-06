"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InlineLoader } from "@/components/states/inline-loader";
import { RemoteImg } from "@/components/shared/remote-img";
import { RemoteVideo } from "@/components/shared/remote-video";
import { insertNewPostAtFeedTop } from "@/features/feed/lib/insert-new-post-into-feed";
import { createPostRequest } from "@/features/feed/services/posts.client";
import { applyInfluencerPostCreateChallenge } from "@/features/influencer/lib/apply-post-create-challenge";
import { mapInfluencerPostCreateChallenge } from "@/features/influencer/lib/map-influencer";
import { showAppToast } from "@/lib/toast/app-toast";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/features/feed/validators/feed.validators";
import { ApiError } from "@/lib/api/errors";
import { useQueryClient } from "@tanstack/react-query";

type PreviewFile = {
  file: File;
  kind: "image" | "video";
  url: string;
};

export function CreatePostForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "connections">(
    "connections"
  );
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      !pending &&
      (description.trim().length > 0 || files.length > 0),
    [description, files.length, pending]
  );

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    setError(null);
    const next: PreviewFile[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setError("Each file must be 50MB or smaller");
        continue;
      }
      const isImage = ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
      );
      const isVideo =
        ALLOWED_VIDEO_TYPES.includes(
          file.type as (typeof ALLOWED_VIDEO_TYPES)[number]
        ) || file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError("Unsupported file type");
        continue;
      }
      next.push({
        file,
        kind: isImage ? "image" : "video",
        url: URL.createObjectURL(file),
      });
    }
    setFiles((prev) => [...prev, ...next].slice(0, 8));
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("description", description.trim());
      form.append("visibility", visibility);
      let imageIndex = 0;
      let videoIndex = 0;
      for (const item of files) {
        if (item.kind === "image") {
          form.append(`images[${imageIndex}]`, item.file, item.file.name);
          imageIndex += 1;
        } else {
          form.append(`videos[${videoIndex}]`, item.file, item.file.name);
          videoIndex += 1;
        }
      }
      const created = await createPostRequest(form);
      const influencer = mapInfluencerPostCreateChallenge(
        created.influencerChallenge
      );
      const influencerEffect = applyInfluencerPostCreateChallenge(
        queryClient,
        influencer
      );
      await insertNewPostAtFeedTop(queryClient, created.id);
      if (influencerEffect === "progress" && influencer) {
        showAppToast.success(
          "Video counted",
          influencer.progressText || "Your video counts toward the Influencer Challenge."
        );
      }
      if (influencerEffect !== "first_video_popup") {
        router.replace("/feed");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to publish");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mx-auto max-w-xl space-y-5" onSubmit={onSubmit}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create post</h1>
        <p className="text-sm text-muted-foreground">
          Share an update with your network. Images and short videos supported.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not publish</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="description">What’s on your mind?</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share a market insight, win, or listing update…"
          rows={6}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "public" | "connections")
          }
          disabled={pending}
        >
          <option value="public">Public</option>
          <option value="connections">Connections only</option>
        </select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="media">Media</Label>
        <input
          id="media"
          type="file"
          accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
          multiple
          className="hidden"
          disabled={pending}
          onChange={(e) => {
            onPickFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={pending || files.length >= 8}
          onClick={() => document.getElementById("media")?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Add photos or video
        </Button>

        {files.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {files.map((item, index) => (
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
                    wrapperClassName="aspect-square w-full"
                    className="aspect-square h-full w-full object-cover"
                    muted
                  />
                )}
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                  aria-label="Remove file"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {pending ? <InlineLoader /> : null}
        Publish
      </Button>
    </form>
  );
}
