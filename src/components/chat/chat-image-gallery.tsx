"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PostMediaLightbox } from "@/components/feed/post-media-lightbox";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

const TILE = "h-[9.5rem] w-full object-cover sm:h-40";

export function ChatImageGallery({
  urls,
  own,
}: {
  urls: string[];
  own: boolean;
}) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const count = urls.length;

  if (count === 0) return null;

  function openAt(index: number) {
    setViewerIndex(index);
  }

  const tileButton = (url: string, index: number, className?: string) => (
    <button
      key={`${url}-${index}`}
      type="button"
      className={cn(
        "relative block overflow-hidden bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
      onClick={() => openAt(index)}
      aria-label={`View image ${index + 1} of ${count}`}
    >
      <RemoteImg
        src={url}
        alt=""
        wrapperClassName="h-full w-full"
        className={TILE}
        draggable={false}
      />
    </button>
  );

  let grid: ReactNode;
  if (count === 1) {
    grid = (
      <button
        type="button"
        className="relative block w-full overflow-hidden bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={() => openAt(0)}
        aria-label="View image"
      >
        <RemoteImg
          src={urls[0]}
          alt=""
          wrapperClassName="w-full max-h-72"
          className="max-h-72 w-full object-cover"
          draggable={false}
        />
      </button>
    );
  } else if (count === 2) {
    grid = (
      <div className="grid grid-cols-2 gap-0.5">
        {urls.slice(0, 2).map((url, index) => tileButton(url, index))}
      </div>
    );
  } else if (count === 3) {
    grid = (
      <div className="grid grid-cols-2 gap-0.5">
        {tileButton(urls[0], 0, "col-span-2")}
        {tileButton(urls[1], 1)}
        {tileButton(urls[2], 2)}
      </div>
    );
  } else {
    const rest = count - 4;
    grid = (
      <div className="grid grid-cols-2 gap-0.5">
        {urls.slice(0, 3).map((url, index) => tileButton(url, index))}
        <button
          type="button"
          className="relative block overflow-hidden bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => openAt(3)}
          aria-label={
            rest > 0
              ? `View image 4 of ${count}, ${rest} more`
              : `View image 4 of ${count}`
          }
        >
          <RemoteImg
            src={urls[3]}
            alt=""
            wrapperClassName="h-full w-full"
            className={TILE}
            draggable={false}
          />
          {rest > 0 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-semibold text-white">
              +{rest}
            </span>
          ) : null}
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "overflow-hidden",
          own ? "rounded-[1.05rem] rounded-br-md" : "rounded-[1.05rem] rounded-bl-md"
        )}
      >
        {grid}
      </div>
      {viewerIndex != null && typeof document !== "undefined"
        ? createPortal(
            <PostMediaLightbox
              urls={urls}
              index={viewerIndex}
              onIndexChange={setViewerIndex}
              onClose={() => setViewerIndex(null)}
            />,
            document.body
          )
        : null}
    </>
  );
}
