"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, RotateCcw, Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ProfileImageLightbox } from "@/components/profile/profile-image-lightbox";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Photo picker for experience / education / certificates.
 *
 * Backend contract: uploading new photos on an update REPLACES the stored set
 * (there is no per-image delete or append). The UI says so explicitly and
 * shows existing photos as "will be replaced" once new ones are picked.
 */
export function ProfileSectionImagesField({
  label = "Photos",
  existingUrls = [],
  files,
  onFilesChange,
  maxFiles = 6,
  hint,
}: {
  label?: string;
  existingUrls?: string[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ urls: string[]; index: number } | null>(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const replacing = files.length > 0 && existingUrls.length > 0;
  const canAdd = files.length < maxFiles;
  const single = maxFiles === 1;

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    if (incoming.length === 0) return;
    const next = single ? [] : [...files];
    let skipped = 0;
    for (const file of incoming) {
      if (next.length >= maxFiles) {
        skipped += 1;
        continue;
      }
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
        skipped += 1;
        continue;
      }
      next.push(file);
    }
    setRejected(
      skipped > 0
        ? `${skipped} file${skipped === 1 ? " was" : "s were"} skipped (images up to 10 MB, max ${maxFiles}).`
        : null
    );
    onFilesChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  const tile = "relative aspect-square overflow-hidden rounded-xl border border-border bg-muted";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-[13px] font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length > 0 ? files.length : existingUrls.length}/{maxFiles}
        </span>
      </div>

      {existingUrls.length > 0 || files.length > 0 ? (
        <div className={cn("grid gap-2", single ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
          {existingUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setViewer({ urls: existingUrls, index: i })}
              className={cn(tile, "group transition", replacing && "opacity-40 grayscale")}
              aria-label="View current photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
              <span className="absolute inset-x-1 bottom-1 rounded-md bg-black/55 px-1.5 py-0.5 text-center text-[10px] font-medium text-white backdrop-blur">
                {replacing ? "Will be replaced" : "Current"}
              </span>
            </button>
          ))}
          {previews.map((url, index) => (
            <div key={url} className={cn(tile, "ring-2 ring-primary/50")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="absolute start-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                New
              </span>
              <button
                type="button"
                className="absolute end-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                aria-label="Remove photo"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {canAdd && !single ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                tile,
                "flex flex-col items-center justify-center gap-1 border-dashed bg-transparent text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
              )}
            >
              <ImagePlus className="h-5 w-5" aria-hidden />
              {existingUrls.length > 0 && files.length === 0 ? "Replace" : "Add"}
            </button>
          ) : null}
        </div>
      ) : null}

      {existingUrls.length === 0 && files.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40"
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground">
            {single ? "Upload an image" : "Upload photos"}
          </span>
          <span className="text-xs text-muted-foreground">
            Drag & drop or click · JPEG, PNG, WebP · up to 10 MB
          </span>
        </button>
      ) : null}

      {single && (existingUrls.length > 0 || files.length > 0) ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          {files.length > 0 ? "Choose a different image" : "Replace image"}
        </button>
      ) : null}

      {replacing ? (
        <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Saving replaces the current {existingUrls.length === 1 ? "photo" : "photos"} with the new {files.length === 1 ? "one" : "ones"}.
          <button
            type="button"
            className="font-semibold underline-offset-2 hover:underline"
            onClick={() => onFilesChange([])}
          >
            Keep current
          </button>
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
      {rejected ? <p className="text-xs text-destructive">{rejected}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={!single}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => addFiles(e.target.files)}
      />

      <ProfileImageLightbox
        images={viewer?.urls ?? []}
        startIndex={viewer?.index ?? null}
        title={label}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}
