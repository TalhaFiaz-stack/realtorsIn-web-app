"use client";

import { ZoomIn } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

export function OffPlanDetailZoomableImage({
  src,
  alt,
  onOpen,
  wrapperClassName,
  className,
  objectFit = "cover",
}: {
  src: string;
  alt: string;
  onOpen: () => void;
  wrapperClassName?: string;
  className?: string;
  objectFit?: "cover" | "contain";
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block w-full cursor-zoom-in overflow-hidden text-start",
        wrapperClassName
      )}
      aria-label={`View ${alt || "image"} full screen`}
    >
      <RemoteImg
        src={src}
        alt={alt}
        wrapperClassName="absolute inset-0 h-full w-full"
        className={cn(
          "h-full w-full",
          objectFit === "contain" ? "object-contain" : "object-cover",
          className
        )}
      />
      <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      <span className="pointer-events-none absolute bottom-2 end-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100">
        <ZoomIn className="h-4 w-4" aria-hidden />
      </span>
    </button>
  );
}
