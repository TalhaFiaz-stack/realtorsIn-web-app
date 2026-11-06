"use client";

import { ImageIcon } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

type Props = {
  cover: string | null;
  embedded?: boolean;
  category?: string | null;
};

export function EventDetailHero({ cover, embedded = false, category }: Props) {
  const frameClass = cn(
    "relative isolate overflow-hidden bg-muted/80",
    embedded
      ? "aspect-[5/2] max-h-44 w-full border-b border-border/80"
      : "aspect-[2/1] w-full"
  );

  if (cover) {
    return (
      <div className={frameClass}>
        <RemoteImg
          src={cover}
          alt=""
          wrapperClassName="absolute inset-0 h-full w-full"
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          aria-hidden
        />
        {embedded && category ? (
          <span className="absolute bottom-2.5 start-4 z-10 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
            {category}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-muted/90 via-background to-muted/50"
        aria-hidden
      />
      <div className="relative flex h-full min-h-[7rem] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground/70">
          <ImageIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          {!embedded ? (
            <span className="text-sm font-medium">No cover image</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
