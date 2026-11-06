"use client";

import { useState } from "react";
import { PostMediaLightbox } from "@/components/feed/post-media-lightbox";
import { RemoteImage } from "@/components/shared/remote-image";
import { RemoteVideo } from "@/components/shared/remote-video";
import { cn } from "@/lib/utils";
import type { FeedPost, PostMediaImage } from "@/features/feed/types/post.types";

/** Mobile feed image height (~perfect(500)) — LinkedIn/Facebook-style. */
const SINGLE_MEDIA_HEIGHT =
  "h-[min(70vh,31.25rem)] min-h-[18rem] w-full";

function MediaTile({
  image,
  className,
  onOpen,
  overlayLabel,
}: {
  image: PostMediaImage;
  className?: string;
  onOpen: () => void;
  overlayLabel?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative block overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onClick={onOpen}
      aria-label={overlayLabel ? `View photo, ${overlayLabel}` : "View photo"}
    >
      <RemoteImage
        src={image.url}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
        fallbackClassName="absolute inset-0"
        unoptimized
      />
      {overlayLabel ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-semibold text-white sm:text-3xl">
          {overlayLabel}
        </span>
      ) : null}
    </button>
  );
}

/** Facebook-style collage for 1–4+ photos. */
function ImageCollage({
  images,
  onOpen,
}: {
  images: PostMediaImage[];
  onOpen: (index: number) => void;
}) {
  const count = images.length;
  const visible = images.slice(0, 4);
  const extra = count - 4;

  if (count === 1) {
    return (
      <MediaTile
        image={visible[0]!}
        className={SINGLE_MEDIA_HEIGHT}
        onOpen={() => onOpen(0)}
      />
    );
  }

  if (count === 2) {
    return (
      <div className="grid h-[min(60vh,28rem)] min-h-[16rem] grid-cols-2 gap-0.5">
        {visible.map((image, index) => (
          <MediaTile
            key={`${image.id ?? image.url}-${index}`}
            image={image}
            className="h-full w-full"
            onOpen={() => onOpen(index)}
          />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid h-[min(65vh,30rem)] min-h-[18rem] grid-cols-2 grid-rows-2 gap-0.5">
        <MediaTile
          image={visible[0]!}
          className="row-span-2 h-full w-full"
          onOpen={() => onOpen(0)}
        />
        <MediaTile
          image={visible[1]!}
          className="h-full w-full"
          onOpen={() => onOpen(1)}
        />
        <MediaTile
          image={visible[2]!}
          className="h-full w-full"
          onOpen={() => onOpen(2)}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[min(65vh,30rem)] min-h-[18rem] grid-cols-2 grid-rows-2 gap-0.5">
      {visible.map((image, index) => (
        <MediaTile
          key={`${image.id ?? image.url}-${index}`}
          image={image}
          className="h-full w-full"
          onOpen={() => onOpen(index)}
          overlayLabel={
            index === 3 && extra > 0 ? `+${extra}` : undefined
          }
        />
      ))}
    </div>
  );
}

export function PostMedia({
  post,
  edgeToEdge = false,
}: {
  post: FeedPost;
  /** Full-bleed media inside a card (Facebook-style). */
  edgeToEdge?: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const images = post.images;
  const videos = post.videos;
  const lightboxUrls = images.map((image) => image.url);

  if (images.length === 0 && videos.length === 0) return null;

  return (
    <>
      <div className={cn(!edgeToEdge && "mt-3")}>
        {images.length > 0 ? (
          <div
            className={cn(
              "overflow-hidden bg-muted",
              !edgeToEdge && "rounded-xl border border-border"
            )}
          >
            <ImageCollage
              images={images}
              onOpen={(index) => setLightboxIndex(index)}
            />
          </div>
        ) : null}

        {videos.map((video, index) => (
          <RemoteVideo
            key={`${video.id ?? video.url}-${index}`}
            src={video.url}
            controls
            playsInline
            preload="metadata"
            wrapperClassName={cn(
              SINGLE_MEDIA_HEIGHT,
              images.length > 0 && "mt-0.5",
              !edgeToEdge && "rounded-xl border border-border"
            )}
            className={cn(SINGLE_MEDIA_HEIGHT, "bg-black object-contain")}
          />
        ))}
      </div>

      {lightboxIndex != null && lightboxUrls.length > 0 ? (
        <PostMediaLightbox
          urls={lightboxUrls}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
