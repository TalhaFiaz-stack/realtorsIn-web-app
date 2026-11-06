"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

export function PostMediaLightbox({
  urls,
  index,
  onIndexChange,
  onClose,
}: {
  urls: string[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const total = urls.length;
  const current = urls[index] ?? urls[0];
  const canPrev = total > 1;
  const canNext = total > 1;

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, onIndexChange, total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    onIndexChange((index + 1) % total);
  }, [index, onIndexChange, total]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [goNext, goPrev, onClose]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={onClose}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
        aria-label="Close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <X className="h-5 w-5" />
      </Button>

      {total > 1 ? (
        <p className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {total}
        </p>
      ) : null}

      {canPrev ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white sm:left-4"
          aria-label="Previous image"
          onClick={(event) => {
            event.stopPropagation();
            goPrev();
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      ) : null}

      {canNext ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white sm:right-4"
          aria-label="Next image"
          onClick={(event) => {
            event.stopPropagation();
            goNext();
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      ) : null}

      <RemoteImg
        src={current}
        alt=""
        wrapperClassName="max-h-[min(92vh,900px)] max-w-[min(96vw,1100px)]"
        className={cn(
          "max-h-[min(92vh,900px)] max-w-[min(96vw,1100px)] object-contain",
          "select-none"
        )}
        onClick={(event) => event.stopPropagation()}
        draggable={false}
      />
    </div>
  );
}
