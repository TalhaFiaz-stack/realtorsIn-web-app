"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/** Full-size viewer for experience / education / certificate images. */
export function ProfileImageLightbox({
  images,
  startIndex,
  title,
  onClose,
}: {
  images: string[];
  /** null = closed. */
  startIndex: number | null;
  title?: string;
  onClose: () => void;
}) {
  const open = startIndex != null && images.length > 0;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (startIndex != null) setIndex(Math.min(startIndex, Math.max(images.length - 1, 0)));
  }, [startIndex, images.length]);

  const many = images.length > 1;
  const go = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  const current = images[index];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-4xl gap-0 overflow-hidden rounded-2xl border-0 bg-black p-0 text-white"
        closeButtonClassName="end-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
        onKeyDown={(e) => {
          if (!many) return;
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogTitle className="sr-only">{title ?? "Image"}</DialogTitle>
        <DialogDescription className="sr-only">
          Image {index + 1} of {images.length}
        </DialogDescription>
        <div className="relative flex h-[min(78dvh,44rem)] items-center justify-center bg-black">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="max-h-full max-w-full object-contain" />
          ) : null}
          {many ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute start-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute end-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-3 bg-black px-4 py-2.5 text-xs text-white/80">
          <span className="min-w-0 flex-1 truncate font-medium text-white">{title}</span>
          {many ? (
            <div className="flex items-center gap-1.5">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          ) : null}
          {current ? (
            <a
              href={current}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white"
            >
              Open original
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
