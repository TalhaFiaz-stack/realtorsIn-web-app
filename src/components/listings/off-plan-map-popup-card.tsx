"use client";

import { X } from "lucide-react";
import { RemoteImg } from "@/components/shared/remote-img";
import { Button } from "@/components/ui/button";
import { formatOffPlanPrice } from "@/features/off-plan/lib/format-off-plan-price";
import type { OffPlanProjectSummary } from "@/features/off-plan/types/off-plan.types";
import { cn } from "@/lib/utils";

export function OffPlanMapPopupCard({
  project,
  onClose,
  onOpen,
  className,
}: {
  project: OffPlanProjectSummary;
  onClose: () => void;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto w-[min(100%,320px)] overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        className
      )}
    >
      <div className="relative aspect-[16/10] bg-muted">
        {project.bannerImage ? (
          <RemoteImg
            src={project.bannerImage}
            alt=""
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
          />
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
        {project.projectStatus ? (
          <span className="absolute start-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {project.projectStatus}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        className="w-full px-3 py-3 text-start hover:bg-muted/40"
        onClick={onOpen}
      >
        <p className="locale-text line-clamp-2 font-semibold">{project.title}</p>
        {project.developerName ? (
          <p className="locale-text mt-0.5 text-sm text-muted-foreground">
            {project.developerName}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          From {formatOffPlanPrice(project.priceStart, project.currency)}
        </p>
      </button>
      <div className="border-t border-border px-3 py-2">
        <Button size="sm" className="w-full" onClick={onOpen}>
          View project
        </Button>
      </div>
    </div>
  );
}
