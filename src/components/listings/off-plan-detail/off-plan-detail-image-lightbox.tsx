"use client";

import { PostMediaLightbox } from "@/components/feed/post-media-lightbox";

/** Full-screen image viewer with close (X) — same behavior as mobile ImageView. */
export function OffPlanDetailImageLightbox({
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
  if (index < 0 || urls.length === 0) return null;
  return (
    <PostMediaLightbox
      urls={urls}
      index={index}
      onIndexChange={onIndexChange}
      onClose={onClose}
    />
  );
}
