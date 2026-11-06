"use client";

import type { SocialProfile } from "@/features/profile/types/profile.types";

/**
 * Exact overlays from mobile Svgicons (`openToWorkIcon` / `hiring`).
 * Self-contained SVGs live in /public/profile.
 */
export function OpenToAvatarFrame({
  openTo,
}: {
  openTo: SocialProfile["openTo"];
}) {
  if (!openTo) return null;

  const src =
    openTo === "open_to_work"
      ? "/profile/open-to-work-frame.svg"
      : "/profile/hiring-frame.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      draggable={false}
    />
  );
}
