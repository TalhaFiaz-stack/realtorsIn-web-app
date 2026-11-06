"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaLoaded } from "@/components/shared/use-media-loaded";
import { cn } from "@/lib/utils";

export type RemoteImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "onLoad"
> & {
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  wrapperClassName?: string;
  skeletonClassName?: string;
  /** Shown when the image fails to load (replaces broken img icon). */
  fallback?: React.ReactNode;
};

/**
 * Native img with shimmer skeleton until the asset loads.
 */
export function RemoteImg({
  className,
  wrapperClassName,
  skeletonClassName,
  fallback,
  src,
  alt = "",
  onLoad,
  onError,
  ...rest
}: RemoteImgProps) {
  const srcKey = typeof src === "string" ? src : undefined;
  const { loaded, markLoaded } = useMediaLoaded(srcKey);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [srcKey]);

  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) {
      markLoaded();
    }
  }, [srcKey, markLoaded]);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        wrapperClassName
      )}
    >
      {failed ? (
        fallback ?? (
          <div
            className={cn(
              "flex h-full min-h-[2rem] w-full items-center justify-center bg-muted",
              className
            )}
            role="img"
            aria-label={alt || "Image unavailable"}
          >
            <ImageOff
              className="h-10 w-10 text-muted-foreground/35"
              strokeWidth={1.25}
              aria-hidden
            />
          </div>
        )
      ) : (
        <>
          {!loaded ? (
            <Skeleton
              className={cn(
                "absolute inset-0 z-[1] rounded-none",
                skeletonClassName
              )}
              aria-hidden
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...rest}
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn(
              className,
              "transition-opacity duration-200",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={(event) => {
              markLoaded();
              onLoad?.(event);
            }}
            onError={(event) => {
              setFailed(true);
              markLoaded();
              onError?.(event);
            }}
          />
        </>
      )}
    </div>
  );
}
