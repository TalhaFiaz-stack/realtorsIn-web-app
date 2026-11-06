"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { useMediaLoaded } from "@/components/shared/use-media-loaded";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RemoteImageProps = Omit<ImageProps, "onError" | "onLoad"> & {
  fallbackClassName?: string;
  skeletonClassName?: string;
  onLoad?: ImageProps["onLoad"];
};

/**
 * next/image wrapper with skeleton while loading and fallback on error.
 * Hosts must be allowlisted in next.config.ts remotePatterns.
 */
export function RemoteImage({
  className,
  fallbackClassName,
  skeletonClassName,
  alt,
  src,
  fill,
  onLoad,
  ...props
}: RemoteImageProps) {
  const srcKey =
    typeof src === "string" ? src : src && "src" in src ? String(src.src) : "";
  const { loaded, markLoaded } = useMediaLoaded(srcKey);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [srcKey]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("bg-muted", fallbackClassName, className)}
      />
    );
  }

  const { priority, loading, ...imageProps } = props;
  const resolvedLoading =
    priority === true ? undefined : (loading ?? "lazy");

  const image = (
    <>
      {!loaded ? (
        <Skeleton
          className={cn(
            "absolute inset-0 z-[1] rounded-none",
            skeletonClassName,
            fill ? fallbackClassName : undefined
          )}
          aria-hidden
        />
      ) : null}
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        fill={fill}
        className={cn(
          className,
          "transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0"
        )}
        priority={priority}
        loading={resolvedLoading}
        onLoad={(event) => {
          markLoaded();
          onLoad?.(event);
        }}
        onError={() => setFailed(true)}
      />
    </>
  );

  if (fill) {
    return <span className="relative block h-full w-full">{image}</span>;
  }

  return (
    <span className="relative inline-block overflow-hidden bg-muted">
      {image}
    </span>
  );
}
