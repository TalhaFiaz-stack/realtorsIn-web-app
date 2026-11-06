"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function ProfileSectionImagesField({
  label = "Photos",
  existingUrls = [],
  files,
  onFilesChange,
  maxFiles = 6,
}: {
  label?: string;
  existingUrls?: string[];
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalCount = existingUrls.length + files.length;
  const canAdd = totalCount < maxFiles;

  function onPick(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length + existingUrls.length >= maxFiles) break;
      if (!file.type.startsWith("image/")) continue;
      next.push(file);
    }
    onFilesChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {existingUrls.map((url) => (
          <div
            key={url}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute end-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              aria-label="Remove photo"
              onClick={() =>
                onFilesChange(files.filter((_, i) => i !== index))
              }
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {canAdd ? (
          <Button
            type="button"
            variant="outline"
            className="h-20 w-20 flex-col gap-1 rounded-lg p-1 text-[10px]"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-5 w-5" />
            Add
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => onPick(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        Up to {maxFiles} images. JPEG, PNG, or WebP.
      </p>
    </div>
  );
}
