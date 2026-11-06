"use client";

import { forwardRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaLoaded } from "@/components/shared/use-media-loaded";
import { cn } from "@/lib/utils";

export type RemoteVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  wrapperClassName?: string;
  skeletonClassName?: string;
};

/**
 * Video element with shimmer skeleton until metadata/first frame is ready.
 */
export const RemoteVideo = forwardRef<HTMLVideoElement, RemoteVideoProps>(
  function RemoteVideo(
    {
      className,
      wrapperClassName,
      skeletonClassName,
      src,
      onLoadedData,
      onCanPlay,
      ...rest
    },
    ref
  ) {
    const srcKey = typeof src === "string" ? src : undefined;
    const { loaded, markLoaded } = useMediaLoaded(srcKey);

    const handleReady = (
      event: React.SyntheticEvent<HTMLVideoElement>,
      handler?: React.ReactEventHandler<HTMLVideoElement>
    ) => {
      markLoaded();
      handler?.(event);
    };

    return (
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          wrapperClassName
        )}
      >
        {!loaded ? (
          <Skeleton
            className={cn(
              "absolute inset-0 z-[1] rounded-none",
              skeletonClassName
            )}
            aria-hidden
          />
        ) : null}
        <video
          {...rest}
          ref={ref}
          src={src}
          className={cn(
            className,
            "transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoadedData={(event) => handleReady(event, onLoadedData)}
          onCanPlay={(event) => handleReady(event, onCanPlay)}
        />
      </div>
    );
  }
);
