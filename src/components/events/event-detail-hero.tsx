"use client";

import { CalendarDays } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { cn } from "@/lib/utils";

type Props = {
  /** Opens the photo viewer (page variant). */
  onOpen?: () => void;
  cover: string | null;
  embedded?: boolean;
  category?: string | null;
};

export function EventDetailHero({ cover, embedded = false, category, onOpen }: Props) {
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
          fallback={<CoverPlaceholder embedded={embedded} />}
        />
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="absolute inset-0 z-[1] cursor-zoom-in"
            aria-label="View event photos"
          />
        ) : null}
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
      <CoverPlaceholder embedded={embedded} />
    </div>
  );
}

/** Branded placeholder for a missing or failed cover image. */
function CoverPlaceholder({ embedded }: { embedded: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 via-muted to-amber-500/10">
      <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
        <CalendarDays className={embedded ? "h-6 w-6" : "h-9 w-9"} strokeWidth={1.5} aria-hidden />
        {!embedded ? <span className="text-xs font-medium">Event photo unavailable</span> : null}
      </div>
    </div>
  );
}
