"use client";

import {
  Avatar,
  AvatarImage,
  AvatarPlaceholderFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Props = {
  /** Used for accessibility when image loads; fallback is icon-only. */
  name?: string;
  imageUrl?: string | null;
  className?: string;
};

export function ActivityRowAvatar({ name, imageUrl, className }: Props) {
  return (
    <Avatar className={cn("shrink-0", className)}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name?.trim() ? `${name} avatar` : ""} />
      ) : null}
      <AvatarPlaceholderFallback />
    </Avatar>
  );
}
